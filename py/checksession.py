# from telethon.sync import TelegramClient
# from telethon.sessions import StringSession

# api_id = 23779743
# api_hash = '224cb2989a32a1138dfac4dd6eb805f4'

# # Clientni yaratish
# client = TelegramClient(StringSession("1ApWapzMBu7wqZK4UzSTgceTiMr-iEVjof_mIufKqE9ySF0Oaw1pjN5SdeyFRXn-v1XK9X6ITxsfSFsXb3P7GBEkMLCipwmUXd3H82NTXiB49nUu-EnfrCEc7aeDgpNqxgMczMHl_0A-GYSoFth7QYyFv-q1YiFSTQN7awYk4ap1yZHNRFCR1XUCvZ47QRPquXbnB94lg1gNgdu-nqeI-Epm7Zh7P40SHaKUkwzswjWdCmu2hZCdcB5HJTehB9cDNQGsJ8JG04TLXtiH4lj_KUZW2G33I-Q1cm03S2Epoge3TfY3G_EzMhuXBMahb8mbjhRaqX4syvVrXhIEk-asteWoYjeRse7k="), api_id, api_hash)

# with client:

#     # Bu yerda avval foydalanuvchi login qilish kerak bo'ladi (telefon raqami va SMS kodi orqali)
#     print("Your session string:", client.session.save())
from telethon.sync import TelegramClient
from telethon.sessions import StringSession

api_id = 23779743
api_hash = '224cb2989a32a1138dfac4dd6eb805f4'
# TelegramClient'ni fayl sessiyasi bilan yaratish

phone_number = '+998994644274'

client = TelegramClient(f'{phone_number}.session', api_id, api_hash)

with client:
    print("You are now logged in and your session is saved as:", f'{phone_number}.session')