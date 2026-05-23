
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS whatsapp_templates jsonb NOT NULL DEFAULT jsonb_build_object(
  'confirm',  'Assalam o Alaikum {name}, aapka order confirm ho gaya hai.

Products:
{products}

Total: Rs {price}
Address: {address}

Shukriya! 🙏',
  'dispatch', 'Assalam o Alaikum {name}, aapka order dispatch ho gaya hai! 🎉

Products:
{products}

Total: Rs {price}
Address: {address}

Jald aapko mil jayega, InshaAllah!',
  'delivery', 'Assalam o Alaikum {name}, aapka order delivery ke liye nikal chuka hai! 🚚

Products:
{products}

Total: Rs {price}
Address: {address}

Please apna phone on rakhein. Shukriya!',
  'cancel',   'Assalam o Alaikum {name}, maazrat ke saath aapka order cancel karna par raha hai.

Products:
{products}

Total: Rs {price}

Agar koi sawal ho toh zaroor poochein. Shukriya!'
);
