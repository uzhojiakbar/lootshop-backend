// const { TelegramClient } = require("telegram");
// const { StringSession } = require("telegram/sessions");
// const input = require("input"); // npm install input
// const { apiId, apiHash } = require("./config"); // Telegram API uchun kerakli ma'lumotlar

// const stringSession = new StringSession(
//   "1AgAOMTQ5LjE1NC4xNjcuNDEBuwQUNoGyRLn1hsmPvd1EaasNcz8oOedxQrq4N98EX9HGsSILXxiPxtzxywHdZUvXmJjBUwYUkyd/s1ihjHhy0qu+MX6Bodkoue7H4BX3y0DvtMQShKH4TQ0Uy3UPU2sxUauPAV0Y/eS2gPk0YLIt1ZeAFy3PFmVDuBPUihzbJ67oACYbKSj0U1GZK/qIoHRFATVPMrMB+YTPHYbwgxdkHWpEasK1610mbf++mNGeNxQ406OuCuZxVebVaDmmjYoFeusxnP4/JpaMPg6obKq6tJ0kVoJoEPG5V/7zY83181cvYdyLlkLcJgB6/Nthms39P1dNruWbgvhNZmqpi6wA5dg="
// ); // Session ma'lumotlari bo'sh

// const chatId = "777000"; // Telegram chat ID sini kiriting

// (async () => {
//   console.log("Loading interactive example...");

//   const client = new TelegramClient(stringSession, apiId, apiHash, {
//     connectionRetries: 5,
//   });

//   await client.start({
//     phoneNumber: async () =>
//       await input.text("Please enter your phone number: "),
//     password: async () => await input.text("Please enter your password: "),
//     phoneCode: async () =>
//       await input.text("Please enter the code you received: "),
//     onError: (err) => console.log(err),
//   });

//   console.log("You should now be connected.");

//   // Save session string to avoid logging in again
//   console.log("Session String:", client.session.save());

//   // Fetch the latest message from the chat
//   try {
//     const messages = await client.getMessages(chatId, { limit: 1 });
//     if (messages.length > 0) {
//       console.log("Latest message:", messages[0].message);
//     } else {
//       console.log("No messages found.");
//     }
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//   }

//   // Optionally, send a message to the chat
//   // await client.sendMessage(chatId, { message: "Hello from GramJS!" });
// })();

const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { apiId, apiHash } = require("./config");

const stringSession = new StringSession(""); // Bu yerga string session qo'ying
const client = new TelegramClient(stringSession, apiId, apiHash, {});

async function getSRPParams() {
  await client.connect(); // Clientni ulash

  try {
    // Avval foydalanuvchini telefon raqami orqali autentifikatsiya qilish
    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: "PHONE_NUMBER",
        apiId: parseInt(apiId, 10),
        apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
          allowMissedCall: true,
        }),
      })
    );

    console.log("Kod yuborildi:", result);

    // Kodni tasdiqlash va 2FA mavjudligini tekshirish
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: "PHONE_NUMBER",
        phoneCodeHash: result.phoneCodeHash,
        phoneCode: "CODE",
      })
    );

    // 2FA mavjudligini tekshirish
    try {
      const result = await client.invoke(
        new Api.auth.CheckPassword({
          password: new Api.InputCheckPasswordSRP({
            srpId: BigInt("srp_id"), // srpId qiymatini bu yerga qo'ying
            a: Buffer.from("a_value"), // a qiymatini bu yerga qo'ying
            m1: Buffer.from("m1_value"), // m1 qiymatini bu yerga qo'ying
          }),
        })
      );

      console.log("2FA tekshirildi:", result);
    } catch (passwordError) {
      console.error("2FA mavjudligini tekshirishda xatolik:", passwordError);
    }
  } catch (error) {
    console.error("Xato:", error);
  }
}

getSRPParams();
