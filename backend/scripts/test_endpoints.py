import urllib.request

def get(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = r.read().decode('utf-8')
            print(data)
    except Exception as e:
        print('ERROR', url, e)

if __name__ == '__main__':
    base = 'http://127.0.0.1:5000'
    print('GET /api/portfolios')
    get(base + '/api/portfolios')
    print('\n---\nGET /api/analytics')
    get(base + '/api/analytics')
