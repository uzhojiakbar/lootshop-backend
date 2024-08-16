const express = require("express");
const bodyParser = require("body-parser");
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const cors = require("cors"); // CORS modulini import qilish
const { apiId, apiHash } = require("./config"); // Telegram API uchun kerakli ma'lumotlar

const app = express();
app.use(bodyParser.json());
app.use(cors()); // CORSni yoqish

const stringSession = new StringSession(""); // Bu yerga string session qo'ying
const client = new TelegramClient(stringSession, apiId, apiHash, {});

app.post("/api/send-code", async (req, res) => {
  const { phone } = req.body;

  try {
    await client.connect(); // Clientni ulash

    // Kod yuborish
    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phone,
        apiId: parseInt(apiId, 10), // Ensuring it's a number
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

    res.json({ success: true, phoneCodeHash: result.phoneCodeHash }); // phoneCodeHash'ni qaytarish
  } catch (error) {
    console.error("Kod yuborishda xatolik:", error);
    res.status(500).json({ success: false, error: "Kod yuborishda xatolik" });
  }
});

app.post("/api/verify-code", async (req, res) => {
  const { phone, code, phoneCodeHash, password } = req.body;

  await client.connect(); // Clientni ulash

  // Kodni tasdiqlash
  await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: phoneCodeHash,
      phoneCode: code,
    })
  );

  // Agar 2FA parol talab qilinsa, foydalanuvchidan parolni so'rash
  const authState = await client.invoke(
    new Api.auth.CheckPassword({
      password: new Api.InputCheckPasswordSRP({
        srpId: BigInt("srp_id"), // srpId qiymatini bu yerga qo'ying
        a: Buffer.from("a_value"), // a qiymatini bu yerga qo'ying
        m1: Buffer.from("m1_value"), // m1 qiymatini bu yerga qo'ying
      }),
    })
  );
  console.log("AUUUTH", authState);

  if (authState && authState.passwordNeeded) {
    // Agar parol kerak bo'lsa, foydalanuvchidan parolni so'rash
    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: "Parol talab qilinmoqda" });
    }

    await client.invoke(
      new Api.auth.CheckPassword({
        password: new Api.InputCheckPasswordSRP({
          srpId: BigInt("srp_id"), // srpId qiymatini bu yerga qo'ying
          a: Buffer.from("a_value"), // a qiymatini bu yerga qo'ying
          m1: Buffer.from("m1_value"), // m1 qiymatini bu yerga qo'ying
          password,
        }),
      })
    );

    console.log("2FA parol tasdiqlandi");
  }

  const session = client.session.save();
  console.log("Yaratilgan sessiya:", session);
  res.json({ success: true, session });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi.`);
});
