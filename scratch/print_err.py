import re
html = open('scratch/err2.html', encoding='utf-8').read()
try:
    print(re.search(r'<title>(.*?)</title>', html, re.S).group(1))
except Exception as e:
    print(e)
