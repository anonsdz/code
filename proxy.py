import requests
import re
import threading
import os
import time
from termcolor import colored

# Các website để lấy proxy (phương thức gốc)
listwebsite = [
    'https://raw.githubusercontent.com/anonsdz/ok/refs/heads/main/1.txt',
    'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/https.txt',
    'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/socks4.txt',
    'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/socks5.txt',
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http',
    'https://www.freeproxychecker.com/result/http_proxies.txt',
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://www.freeproxychecker.com/result/https_proxies.txt',
    'https://www.proxy-list.download/api/v1/get?type=http',
    'https://spys.me/proxy.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
    'https://api.openproxylist.xyz/http.txt',
    'https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt',
    'http://alexa.lr2b.com/proxylist.txt',
    'http://rootjazz.com/proxies/proxies.txt',
    'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
    'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
    'https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt',
    'https://proxy-spider.com/api/proxies.example.txt',
    'https://multiproxy.org/txt_all/proxy.txt',
    'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
    'https://raw.githubusercontent.com/saisuiu/Lionkings-Http-Proxys-Proxies/main/free.txt',
    'https://raw.githubusercontent.com/saisuiu/Lionkings-Http-Proxys-Proxies/main/cnfree.txt',
    'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt',
    'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt',
    'https://raw.githubusercontent.com/MrMarble/proxy-list/main/all.txt',
    'https://sunny9577.github.io/proxy-scraper/proxies.txt',
    'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
    'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt',
    "https://openproxylist.xyz/http.txt",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt",
    "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt",
    "https://raw.githubusercontent.com/andigwandi/free-proxy/main/proxy_list.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/zloi-user/hideip.me/main/connect.txt",
    "https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt",
    "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt",
    "https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt",
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
    "https://raw.githubusercontent.com/TuanMinPay/live-proxy/refs/heads/master/all.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/refs/heads/main/HTTPS_RAW.txt",
    'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt',
    'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt',
    'https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/proxylist-to/proxy-list/main/http.txt',
    'https://raw.githubusercontent.com/yuceltoluyag/GoodProxy/main/raw.txt',
    'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
    'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt',
    'https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt',
    'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
    'https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt',
    'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/https_proxies.txt',
    'https://api.openproxylist.xyz/http.txt',
    'https://api.proxyscrape.com/v2/?request=displayproxies',
    'https://api.proxyscrape.com/?request=displayproxies&proxytype=http',
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://www.proxydocker.com/en/proxylist/download?email=noshare&country=all&city=all&port=all&type=all&anonymity=all&state=all&need=all',
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=anonymous',
    'http://worm.rip/http.txt',
    'https://proxyspace.pro/http.txt',
    'https://multiproxy.org/txt_all/proxy.txt',
    'https://proxy-spider.com/api/proxies.example.txt',
]


# Các trang proxy cần truy cập (phương thức mới)
pages = [
    "https://free-proxy-list.net",
    "https://www.sslproxies.org",
    "https://us-proxy.org"
]

# Danh sách chứa các proxy tìm được
def get_proxies_from_website(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            proxy_pattern = r'\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+)\b'
            return re.findall(proxy_pattern, response.text)
        return []
    except requests.RequestException as e:
        print(f"URL lỗi: {url} - {e}")
        return []

# Lấy proxy từ các trang web mới (phương thức bổ sung)
def get_proxies_from_new_sources():
    proxies_list = []
    for page in pages:
        try:
            response = requests.get(page)
            if response.status_code == 200:  # Kiểm tra xem trang đã tải thành công
                # Tìm các địa chỉ IP:Port bằng regex
                matches = re.findall(r"\d+\.\d+\.\d+\.\d+:\d+", response.text)
                proxies_list.extend(matches)  # Thêm vào danh sách
        except requests.RequestException as e:
            print(f"Không thể lấy proxy từ {page}: {e}")
    return proxies_list

# Xoá màn hình terminal
def clear():
    os.system("cls" if os.name == "nt" else "clear")

# Lớp ProxyInfo để lấy thông tin proxy
class ProxyInfo:
    def __init__(self, proxy):
        self.proxy = proxy
        self.location = None
        self.type = None
        self.response_time = None
        self.country = None
        self.org = None

    def determine_location(self):
        try:
            response = requests.get('https://ipinfo.io/json', proxies={"http": self.proxy, "https": self.proxy}, timeout=15)
            data = response.json()
            self.location = data.get("city", "Không xác định")
            self.country = data.get("country", "Không xác định")
            self.org = data.get("org", "Không xác định")
            return True
        except:
            self.location = "Không xác định"
            self.country = "Không xác định"
            self.org = "Không xác định"
            return False

    def determine_type(self):
        types = ["http", "https"]
        for t in types:
            try:
                response = requests.get("https://ipinfo.io/json", proxies={t: self.proxy}, timeout=15)
                if response.status_code == 200:
                    self.type = t.upper()
                    return
            except:
                pass
        self.type = "Không xác định"

    def measure_response_time(self):
        try:
            response = requests.get("https://ipinfo.io/json", proxies={"http": self.proxy, "https": self.proxy}, timeout=15)
            self.response_time = response.elapsed.total_seconds()
        except:
            self.response_time = float('inf')

    def get_info(self):
        is_live = self.determine_location()
        if is_live:
            self.determine_type()
            self.measure_response_time()
        return is_live

# Lưu proxy vào tệp proxy.txt
def save_proxies_to_file():
    proxies = set()  # Sử dụng set để loại bỏ các proxy trùng lặp
    # Lấy proxy từ các website cũ
    for url in listwebsite:
        print(f"Đang lấy proxy từ {url}...")
        new_proxies = get_proxies_from_website(url)
        proxies.update(new_proxies)

    # Lấy proxy từ các website mới
    print("Đang lấy proxy từ các website mới...")
    new_proxies_from_new_sources = get_proxies_from_new_sources()
    proxies.update(new_proxies_from_new_sources)

    # Lưu tất cả proxy vào tệp proxy.txt
    with open("proxy.txt", "w") as file:
        for proxy in proxies:
            file.write(proxy + "\n")
    
    print(f"Đã lưu {len(proxies)} proxy vào tệp proxy.txt")

# Kiểm tra proxy sống và lưu vào live.txt
def check_live_proxies(filename, num_threads):
    proxy_pattern = re.compile(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$')
    lock = threading.Lock()
    live_proxies = set()  # Tập hợp để lưu các proxy sống

    def check_proxy_thread(proxy):
        proxy_info = ProxyInfo(proxy)
        if proxy_info.get_info():
            if proxy_pattern.match(proxy):
                clear()
                print(colored(f"IP: {proxy}", "green"))
                print(colored(f"Quốc gia: {proxy_info.country}", "green"))
                print(colored(f"Tổ chức: {proxy_info.org}", "green"))
                print(colored(f"Thành phố: {proxy_info.location}", "green"))
                print(colored(f"Loại proxy: {proxy_info.type}", "green"))
                
                with lock:
                    if proxy not in live_proxies:  # Kiểm tra xem proxy đã tồn tại chưa
                        live_proxies.add(proxy)
                        with open("live.txt", "a") as file:
                            file.write(proxy + "\n")
            else:
                print(colored(f"{proxy} - Định dạng không hợp lệ", "yellow"))
        else:
            clear()
            print(colored(f"IP: {proxy} - Proxy không hoạt động", "red"))

    while True:  # Vòng lặp vô hạn để kiểm tra các proxy liên tục
        with open(filename, 'r', encoding='ISO-8859-1') as file:
            proxies = file.readlines()
            threads = []

            for proxy in proxies:
                proxy = proxy.strip()
                thread = threading.Thread(target=check_proxy_thread, args=(proxy,))
                thread.start()
                threads.append(thread)

                if len(threads) >= num_threads:
                    for thread in threads:
                        thread.join()
                    threads = []

            for thread in threads:
                thread.join()

        print("Đã hoàn tất kiểm tra một vòng. Tiếp tục kiểm tra từ đầu...")
        print("Đang lấy proxy mới...")
        os.remove("proxy.txt")  # Xóa dữ liệu trong proxy.txt
        save_proxies_to_file()  # Lấy lại proxy mới và lưu vào proxy.txt

if __name__ == "__main__":
    try:
        clear()
        # Bước 1: Lấy proxy từ các website và lưu vào proxy.txt
        save_proxies_to_file()
        # Bước 2: Kiểm tra các proxy sống từ proxy.txt
        num_threads = 100000  # Giới hạn số lượng luồng (có thể điều chỉnh theo ý muốn)
        check_live_proxies("proxy.txt", num_threads)
    except KeyboardInterrupt:
        print("Đang thoát... Vui lòng chờ một chút...")
        time.sleep(1)
