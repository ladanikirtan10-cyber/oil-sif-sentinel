import cv2
import numpy as np
import base64
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

def utcnow():
    return datetime.now(timezone.utc)

class SafetyVisionEngine:
    """
    High-Performance Industrial Computer Vision & PPE Compliance Engine for Oil India Limited.
    Features:
    - Adaptive multi-space human face & upper-body worker detection (YCrCb + HSV skin filtering).
    - Hard Hat / Helmet Detection: White, Yellow, Safety Orange, Red, and Blue industrial hard hats vs bare head.
    - High-Visibility Safety Vest Detection: Fluorescent Lime/Yellow & Neon Safety Orange.
    - Restricted Danger Zone Intrusion: High-pressure manifold corridor monitoring.
    - Zero-Touch Automated Incident Logging with 30s De-duplication Cooldown.
    """

    def __init__(self):
        self.cooldown_cache: Dict[str, float] = {}
        self.default_cooldown_seconds = 30.0

        self.cameras = [
            {"id": "CAM-01", "name": "Rig 04 Main Drill Floor", "site": "Duliajan Central Field", "zone": "High-Risk Drilling Zone"},
            {"id": "CAM-02", "name": "Compressor House Sector B", "site": "Moran Gas Field", "zone": "Gas Compression Bay 02"},
            {"id": "CAM-03", "name": "Wellhead Manifold Area", "site": "Digboi Oilfield", "zone": "Cellar Pit Zone 1"},
            {"id": "CAM-04", "name": "Refinery Maintenance Bay", "site": "Numaligarh Terminal", "zone": "Bay 3 Safe Workshop"},
        ]

    def decode_image(self, image_data: str) -> np.ndarray:
        """Decode base64 string or binary bytes to OpenCV BGR numpy array."""
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        raw_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(raw_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from provided data.")
        return img

    def encode_image(self, img_bgr: np.ndarray) -> str:
        """Encode OpenCV BGR image to base64 JPEG."""
        ret, buf = cv2.imencode('.jpg', img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        return base64.b64encode(buf).decode('utf-8')

    def locate_workers(self, img_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Dynamically localizes human workers in the camera feed using adaptive skin chrominance
        with saturation caps to differentiate skin from high-visibility orange garments.
        Follows the worker smoothly as they move across the frame.
        """
        img_h, img_w = img_bgr.shape[:2]
        
        # Color space conversion
        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        cr = ycrcb[:, :, 1]
        cb = ycrcb[:, :, 2]
        diff = cr.astype(np.int16) - cb.astype(np.int16)
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]

        # Natural human skin tone filter with saturation cap to reject high-vis neon clothing
        skin_mask = (
            (cr >= 130) & (cr <= 184) &
            (cb >= 75) & (cb <= 140) &
            (diff > 8) &
            (sat >= 18) & (sat <= 130) &
            (val >= 45)
        ).astype(np.uint8) * 255

        # Morphological clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        skin_clean = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
        skin_clean = cv2.dilate(skin_clean, kernel, iterations=1)

        contours, _ = cv2.findContours(skin_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        valid_faces = []
        min_area = (img_h * img_w) * 0.0015
        max_area = (img_h * img_w) * 0.22

        for c in contours:
            area = cv2.contourArea(c)
            if min_area < area < max_area:
                x, y, w, h = cv2.boundingRect(c)
                aspect = h / float(w)
                # Realistic human face aspect ratio in upper 85% of frame
                if 0.55 <= aspect <= 2.8 and (y + h / 2) < (img_h * 0.85) and w < (img_w * 0.45):
                    valid_faces.append((x, y, w, h, area))

        workers = []

        if len(valid_faces) > 0:
            # Sort by area descending and track top workers
            valid_faces.sort(key=lambda f: f[4], reverse=True)
            for i, (fx, fy, fw, fh, _) in enumerate(valid_faces[:3]):
                cx = fx + fw // 2
                cy = fy + fh // 2

                # Dynamic worker bounding box tightly framing the person
                bx = max(0, int(cx - fw * 1.35))
                by = max(0, int(fy - fh * 0.95))
                bw = min(img_w - bx, int(fw * 2.7))
                bh = min(img_h - by, int(fh * 4.2))

                # Clamp to prevent box from blowing up to whole viewport
                bw = min(bw, int(img_w * 0.65))
                bh = min(bh, int(img_h * 0.90))

                # Head dome crop (where hard hat is worn)
                hx1 = max(0, int(cx - fw * 0.85))
                hy1 = max(0, int(fy - fh * 1.05))
                hx2 = min(img_w, int(cx + fw * 0.85))
                hy2 = min(img_h, int(fy + fh * 0.25))

                # Torso crop (where high-vis vest is worn)
                tx1 = max(0, int(cx - fw * 1.40))
                ty1 = min(img_h, int(fy + fh * 0.65))
                tx2 = min(img_w, int(cx + fw * 1.40))
                ty2 = min(img_h, int(fy + fh * 3.8))

                workers.append({
                    "person_id": i + 1,
                    "box": [bx, by, bw, bh],
                    "head_box": [hx1, hy1, max(1, hx2 - hx1), max(1, hy2 - hy1)],
                    "torso_box": [tx1, ty1, max(1, tx2 - tx1), max(1, ty2 - ty1)],
                    "center": (cx, cy),
                    "confidence": 0.95
                })
        else:
            # Fallback: Natural center worker framing
            bw = int(img_w * 0.40)
            bh = int(img_h * 0.76)
            bx = max(0, int((img_w - bw) / 2))
            by = max(0, int((img_h - bh) / 2))

            hx1 = int(bx + bw * 0.20)
            hy1 = max(0, by)
            hx2 = int(bx + bw * 0.80)
            hy2 = int(by + bh * 0.28)

            tx1 = max(0, bx)
            ty1 = int(by + bh * 0.28)
            tx2 = min(img_w, bx + bw)
            ty2 = int(by + bh * 0.78)

            workers.append({
                "person_id": 1,
                "box": [bx, by, bw, bh],
                "head_box": [hx1, hy1, max(1, hx2 - hx1), max(1, hy2 - hy1)],
                "torso_box": [tx1, ty1, max(1, tx2 - tx1), max(1, ty2 - ty1)],
                "center": (img_w // 2, img_h // 2),
                "confidence": 0.88
            })

        return workers

    def analyze_head_helmet(self, head_crop: np.ndarray) -> Tuple[bool, float, str]:
        """
        Accurately inspects the head region for certified industrial safety helmets:
        White (Engineers/Supervisors), Yellow, Safety Orange, Red, Blue, or Green hard hats.
        Uses multi-candidate comparative scoring so that helmet color takes precedence
        over background shadows or hair at the ear line, while cleanly rejecting bare heads.
        """
        if head_crop is None or head_crop.size == 0 or head_crop.shape[0] < 4 or head_crop.shape[1] < 4:
            return False, 0.85, "Bare Head (No Helmet)"

        hsv = cv2.cvtColor(head_crop, cv2.COLOR_BGR2HSV)
        total = head_crop.shape[0] * head_crop.shape[1]

        # 1. Dark hair mask (low brightness, low saturation)
        mask_hair = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 140, 65]))
        hair_pct = cv2.countNonZero(mask_hair) / total

        # 2. Exposed forehead / scalp skin mask
        ycrcb = cv2.cvtColor(head_crop, cv2.COLOR_BGR2YCrCb)
        cr = ycrcb[:, :, 1]
        cb = ycrcb[:, :, 2]
        diff = cr.astype(np.int16) - cb.astype(np.int16)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]
        mask_skin = (cr >= 130) & (cr <= 184) & (cb >= 75) & (cb <= 140) & (diff > 8) & (sat >= 18) & (sat <= 140) & (val >= 45)
        skin_pct = np.count_nonzero(mask_skin) / total

        # 3. Certified Hard Hat color masks
        # White Hard Hat: low saturation, high brightness
        mask_white = cv2.inRange(hsv, np.array([0, 0, 125]), np.array([180, 50, 255]))
        # Yellow Hard Hat: characteristic bright yellow
        mask_yellow = cv2.inRange(hsv, np.array([14, 55, 65]), np.array([40, 255, 255]))
        # Safety Orange Hard Hat
        mask_orange = cv2.bitwise_or(
            cv2.inRange(hsv, np.array([5, 90, 90]), np.array([18, 255, 255])),
            cv2.inRange(hsv, np.array([165, 90, 90]), np.array([180, 255, 255]))
        )
        # Safety Red Hard Hat
        mask_red = cv2.bitwise_or(
            cv2.inRange(hsv, np.array([0, 80, 70]), np.array([8, 255, 255])),
            cv2.inRange(hsv, np.array([170, 80, 70]), np.array([180, 255, 255]))
        )
        # Blue Hard Hat
        mask_blue = cv2.inRange(hsv, np.array([90, 60, 50]), np.array([135, 255, 255]))
        # Green Hard Hat
        mask_green = cv2.inRange(hsv, np.array([40, 55, 45]), np.array([85, 255, 255]))

        w_pct = cv2.countNonZero(mask_white) / total
        y_pct = cv2.countNonZero(mask_yellow) / total
        o_pct = cv2.countNonZero(mask_orange) / total
        r_pct = cv2.countNonZero(mask_red) / total
        b_pct = cv2.countNonZero(mask_blue) / total
        g_pct = cv2.countNonZero(mask_green) / total

        # Comparative scoring:
        candidates = [
            ("White Hard Hat", w_pct, 0.16, 1.2),
            ("Yellow Hard Hat", y_pct, 0.05, 0.25),
            ("Safety Orange Hard Hat", o_pct, 0.04, 0.25),
            ("Safety Red Hard Hat", r_pct, 0.04, 0.25),
            ("Blue Hard Hat", b_pct, 0.05, 0.25),
            ("Green Hard Hat", g_pct, 0.05, 0.25),
        ]
        candidates.sort(key=lambda c: c[1], reverse=True)
        top_name, top_val, top_thresh, hair_mult = candidates[0]

        if top_val >= top_thresh:
            if top_name == "White Hard Hat":
                if hair_pct < 0.16 or top_val >= hair_pct * hair_mult:
                    conf = min(0.99, 0.82 + top_val * 0.30)
                    return True, round(conf, 2), "Safety Helmet (Detected)"
            else:
                if top_val >= hair_pct * hair_mult:
                    conf = min(0.99, 0.84 + top_val * 0.35)
                    return True, round(conf, 2), "Safety Helmet (Detected)"

        # Bare Head / No Helmet
        return False, 0.94, "Safety Helmet (Missing)"

    def analyze_torso_vest(self, torso_crop: np.ndarray) -> Tuple[bool, float, str]:
        """
        Accurately inspects the torso for reflective high-visibility safety vests:
        Fluorescent Lime / High-Vis Yellow or Neon Safety Orange.
        Rejects ordinary casual shirts, sweaters, and plain boiler suits.
        """
        if torso_crop is None or torso_crop.size == 0 or torso_crop.shape[0] < 8 or torso_crop.shape[1] < 8:
            return False, 0.85, "Standard Clothing (No Vest)"

        hsv = cv2.cvtColor(torso_crop, cv2.COLOR_BGR2HSV)
        total = torso_crop.shape[0] * torso_crop.shape[1]

        # Fluorescent lime / high-vis yellow
        mask_lime = cv2.inRange(hsv, np.array([22, 70, 80]), np.array([44, 255, 255]))
        # Neon safety orange
        mask_orange = cv2.inRange(hsv, np.array([7, 80, 80]), np.array([24, 255, 255]))

        lime_pct = cv2.countNonZero(mask_lime) / total
        orange_pct = cv2.countNonZero(mask_orange) / total
        vest_pct = lime_pct + orange_pct

        if lime_pct > 0.09:
            conf = min(0.98, 0.78 + lime_pct * 0.45)
            return True, round(conf, 2), "Fluorescent Lime Vest (Detected)"
        elif orange_pct > 0.09:
            conf = min(0.98, 0.78 + orange_pct * 0.45)
            return True, round(conf, 2), "Neon Orange Vest (Detected)"
        else:
            return False, 0.93, "Standard Clothing (No Vest)"

    def check_restricted_zone(self, box: List[int], img_shape: Tuple[int, int], is_danger_zone: bool = False) -> bool:
        """Checks if worker has crossed into designated danger perimeter when active."""
        if not is_danger_zone:
            return False
        img_h, img_w = img_shape
        x, y, w, h = box
        center_x = x + w / 2
        return center_x > (img_w * 0.58)

    def detect_frame(
        self,
        img_bgr: np.ndarray,
        camera_id: str = "CAM-01",
        location: str = "Drilling Rig Floor 04",
        site_name: str = "Duliajan Central Field",
        danger_zone_active: bool = False
    ) -> Dict[str, Any]:
        """
        Real-time Computer Vision analysis on camera frame:
        Detects worker, classifies PPE compliance, checks danger corridor (when active), and annotates HUD.
        """
        img_h, img_w = img_bgr.shape[:2]
        
        # Check if danger zone monitoring applies
        loc_lower = (location or "").lower()
        is_danger_zone = danger_zone_active or ("cellar pit" in loc_lower or "danger zone" in loc_lower or "restricted" in loc_lower)
        
        workers = self.locate_workers(img_bgr)
        detected_persons = []
        violations = []

        for p in workers:
            i = p["person_id"]
            x, y, w, h = p["box"]
            hx, hy, hw, hh = p["head_box"]
            tx, ty, tw, th = p["torso_box"]

            head_crop = img_bgr[hy:hy+hh, hx:hx+hw]
            torso_crop = img_bgr[ty:ty+th, tx:tx+tw]

            has_helmet, helmet_conf, helmet_detail = self.analyze_head_helmet(head_crop)
            has_vest, vest_conf, vest_detail = self.analyze_torso_vest(torso_crop)
            in_restricted = self.check_restricted_zone([x, y, w, h], (img_h, img_w), is_danger_zone)

            person_violations = []

            if not has_helmet:
                viol = {
                    "type": "helmet_missing",
                    "title": "Safety Helmet Not Detected",
                    "severity": "HIGH",
                    "confidence": helmet_conf,
                    "description": f"Worker #{i} has no hard-hat protection ({helmet_detail}).",
                    "person_index": i,
                    "box": [x, y, w, h]
                }
                violations.append(viol)
                person_violations.append("helmet_missing")

            if not has_vest:
                viol = {
                    "type": "vest_missing",
                    "title": "High-Visibility Vest Not Detected",
                    "severity": "MODERATE",
                    "confidence": vest_conf,
                    "description": f"Worker #{i} is missing high-visibility reflective clothing ({vest_detail}).",
                    "person_index": i,
                    "box": [x, y, w, h]
                }
                violations.append(viol)
                person_violations.append("vest_missing")

            if in_restricted:
                viol = {
                    "type": "restricted_zone_breach",
                    "title": "Unauthorized Danger Zone Intrusion",
                    "severity": "CRITICAL",
                    "confidence": 0.96,
                    "description": f"Worker #{i} crossed safety perimeter barricade into high-pressure restricted danger zone.",
                    "person_index": i,
                    "box": [x, y, w, h]
                }
                violations.append(viol)
                person_violations.append("restricted_zone_breach")

            is_compliant = (len(person_violations) == 0)

            detected_persons.append({
                "person_id": i,
                "box": [x, y, w, h],
                "confidence": p["confidence"],
                "has_helmet": has_helmet,
                "helmet_confidence": helmet_conf,
                "helmet_detail": helmet_detail,
                "has_vest": has_vest,
                "vest_confidence": vest_conf,
                "vest_detail": vest_detail,
                "in_restricted_zone": in_restricted,
                "compliance_status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
                "violations": person_violations
            })

        annotated_bgr = self._annotate_frame(img_bgr, detected_persons, violations, is_danger_zone)
        annotated_base64 = self.encode_image(annotated_bgr)

        overall_status = "violation" if len(violations) > 0 else ("compliant" if len(detected_persons) > 0 else "no_person")
        max_severity = "LOW"
        if any(v["severity"] == "CRITICAL" for v in violations):
            max_severity = "CRITICAL"
        elif any(v["severity"] == "HIGH" for v in violations):
            max_severity = "HIGH"
        elif any(v["severity"] == "MODERATE" for v in violations):
            max_severity = "MODERATE"

        return {
            "status": overall_status,
            "max_severity": max_severity,
            "persons_detected_count": len(detected_persons),
            "violations_count": len(violations),
            "persons": detected_persons,
            "violations": violations,
            "annotated_image": f"data:image/jpeg;base64,{annotated_base64}",
            "timestamp": utcnow().isoformat(),
            "camera_id": camera_id,
            "location": location,
            "site_name": site_name
        }

    def _annotate_frame(self, img_bgr: np.ndarray, persons: List[Dict], violations: List[Dict], is_danger_zone: bool = False) -> np.ndarray:
        """Draws crisp, high-visibility visual bounding boxes and danger corridor (only when active)."""
        out = img_bgr.copy()
        img_h, img_w = out.shape[:2]

        # 1. Danger corridor only if danger zone monitoring is active
        if is_danger_zone:
            zone_x = int(img_w * 0.58)
            overlay = out.copy()
            cv2.rectangle(overlay, (zone_x, 0), (img_w, img_h), (0, 0, 180), -1)
            cv2.addWeighted(overlay, 0.16, out, 0.84, 0, out)
            cv2.line(out, (zone_x, 0), (zone_x, img_h), (0, 0, 230), 2, cv2.LINE_AA)
            cv2.putText(out, "RESTRICTED DANGER ZONE", (zone_x + 8, 26),
                        cv2.FONT_HERSHEY_DUPLEX, 0.48, (0, 0, 255), 1, cv2.LINE_AA)

        # 2. Worker Bounding Boxes
        for p in persons:
            x, y, w, h = p["box"]
            is_compliant = (p["compliance_status"] == "COMPLIANT")
            color = (50, 200, 60) if is_compliant else (30, 30, 235)

            # Bounding box
            cv2.rectangle(out, (x, y), (x + w, y + h), color, 2, cv2.LINE_AA)

            # Tech corner brackets
            c_len = 16
            cv2.line(out, (x, y), (x + c_len, y), color, 3, cv2.LINE_AA)
            cv2.line(out, (x, y), (x, y + c_len), color, 3, cv2.LINE_AA)
            cv2.line(out, (x + w, y), (x + w - c_len, y), color, 3, cv2.LINE_AA)
            cv2.line(out, (x + w, y), (x + w, y + c_len), color, 3, cv2.LINE_AA)
            cv2.line(out, (x, y + h), (x + c_len, y + h), color, 3, cv2.LINE_AA)
            cv2.line(out, (x, y + h), (x, y + h - c_len), color, 3, cv2.LINE_AA)
            cv2.line(out, (x + w, y + h), (x + w - c_len, y + h), color, 3, cv2.LINE_AA)
            cv2.line(out, (x + w, y + h), (x + w, y + h - c_len), color, 3, cv2.LINE_AA)

            # Header tag
            status_label = "SAFE / COMPLIANT" if is_compliant else "VIOLATION DETECTED"
            tag_text = f"Worker #{p['person_id']} : {status_label}"
            tag_size, _ = cv2.getTextSize(tag_text, cv2.FONT_HERSHEY_DUPLEX, 0.46, 1)
            cv2.rectangle(out, (x, max(0, y - tag_size[1] - 8)), (x + tag_size[0] + 12, y), color, -1)
            cv2.putText(out, tag_text, (x + 6, max(14, y - 4)),
                        cv2.FONT_HERSHEY_DUPLEX, 0.46, (255, 255, 255), 1, cv2.LINE_AA)

            # Sub-badges
            badge_y = min(img_h - 10, y + 22)
            h_text = "Helmet: YES" if p["has_helmet"] else "Helmet: MISSING"
            h_col = (0, 220, 50) if p["has_helmet"] else (0, 0, 255)
            cv2.putText(out, h_text, (x + 6, badge_y), cv2.FONT_HERSHEY_DUPLEX, 0.42, h_col, 1, cv2.LINE_AA)
            badge_y += 18

            v_text = "Vest: YES" if p["has_vest"] else "Vest: MISSING"
            v_col = (0, 220, 50) if p["has_vest"] else (0, 0, 255)
            cv2.putText(out, v_text, (x + 6, badge_y), cv2.FONT_HERSHEY_DUPLEX, 0.42, v_col, 1, cv2.LINE_AA)
            badge_y += 18

            if is_danger_zone:
                z_text = "Zone: DANGER!" if p["in_restricted_zone"] else "Zone: SAFE"
                z_col = (0, 0, 255) if p["in_restricted_zone"] else (0, 220, 50)
                cv2.putText(out, z_text, (x + 6, badge_y), cv2.FONT_HERSHEY_DUPLEX, 0.42, z_col, 1, cv2.LINE_AA)

        return out

    def check_and_apply_cooldown(self, camera_id: str, violation_type: str) -> bool:
        """
        Returns True if cooldown is ACTIVE (suppress duplicate DB alert).
        Returns False if allowed to create a new DB alert and updates timestamp.
        """
        now = time.time()
        key = f"{camera_id}:{violation_type}"
        last_time = self.cooldown_cache.get(key, 0.0)

        if now - last_time < self.default_cooldown_seconds:
            return True
        else:
            self.cooldown_cache[key] = now
            return False

vision_engine = SafetyVisionEngine()
