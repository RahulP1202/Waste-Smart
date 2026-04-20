with open('wastesmart-main/frontend-react/src/pages/History.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'return s\n  })()\n      {/* Topbar */}'
new = 'return s\n  })()\n\n  return (\n    <div className="hist-root">\n      {/* Topbar */}'
content = content.replace(old, new)

with open('wastesmart-main/frontend-react/src/pages/History.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed. Occurrences replaced:', 1 if old in content else 0)
