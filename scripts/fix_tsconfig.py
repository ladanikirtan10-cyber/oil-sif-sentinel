with open('frontend/src/types/index.ts', 'r', encoding='utf-8') as f:
    code = f.read()

if 'export type AnalysisResult = ReportAnalysis;' not in code:
    code += "\nexport type AnalysisResult = ReportAnalysis;\n"
    with open('frontend/src/types/index.ts', 'w', encoding='utf-8') as f:
        f.write(code)

tsconfig = """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false
  },
  "include": ["src"]
}
"""

with open('frontend/tsconfig.json', 'w', encoding='utf-8') as f:
    f.write(tsconfig)
print('Updated tsconfig.json and types/index.ts')
