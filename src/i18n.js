import { createContext, useContext } from "react";
import { CITIES } from "./cities.js";
import { CITY_NAMES_LATIN } from "./cityNames.js";

export const LANGS = [
  { code: "ar", name: "العربية", locale: "ar-EG", dir: "rtl" },
  { code: "en", name: "English", locale: "en", dir: "ltr" },
  { code: "fr", name: "Français", locale: "fr", dir: "ltr" },
  { code: "tr", name: "Türkçe", locale: "tr", dir: "ltr" },
  { code: "id", name: "Bahasa Indonesia", locale: "id", dir: "ltr" },
  { code: "ur", name: "اردو", locale: "ur", dir: "rtl" },
];

const VIDEO = "https://www.youtube.com/watch?v=hqMDzHqbeAQ";

const D = {
  ar: {
    title: "الأذان حول العالم",
    metaTitle: "الأذان حول العالم — مباشر",
    share: "شارك الصفحة", copied: "اتنسخ الرابط، ابعته لصحابك", copyFail: "انسخ الرابط من شريط العنوان",
    live: "مباشر دلوقتي", paused: "متوقف", tlPill: "يوم كامل في دقيقة",
    h1a: "الأذان ما بيسكتش", h1b: "ولا ثانية",
    lead: "الأرض بتلف، فوقت كل صلاة بيتنقّل من مدينة للي بعدها من غير ما يقف. الخطوط الملوّنة على الكرة بتوريك الأذان واصل لحد فين في اللحظة دي.",
    nowPre: "دلوقتي بيأذّن في", nowPost: (n) => (n === 1 ? "مدينة على الخريطة" : "مدن على الخريطة"),
    nextIn: (c, p, d) => `الأذان الجاي في ${c} (${p}) ${d}`,
    tlBtn: "شوف يوم كامل في دقيقة", resume: "كمّل", pause: "وقّف", backLive: "رجوع للمباشر",
    deviceTime: "بتوقيت جهازك",
    globe: "كرة", map: "خريطة", spinOn: "بتلف لوحدها", spinOff: "اللف واقف",
    landFail: "تعذّر تحميل حدود الدول، بس المواقيت شغّالة عادي", landLoading: "بنحمّل الخريطة…",
    sun: "الشمس",
    dragHint: "اسحب الكرة عشان تلفها، واضغط على أي نقطة عشان تختار المدينة", tapHint: "اضغط على أي نقطة عشان تختار المدينة",
    howTitle: "إزاي ده بيحصل؟",
    steps: [
      ["الأرض بتلف", "كل ٢٤ ساعة الأرض بتلف لفّة كاملة، فالشمس بتبان بتعدّي على المدن واحدة ورا التانية من الشرق للغرب."],
      ["الصلاة مربوطة بالشمس", "كل صلاة ليها لحظة معيّنة في مكان الشمس: طلوع النور، أعلى نقطة، الغروب… فوقتها بيتنقّل مع الشمس."],
      ["المساجد في كل حتة", "عشان فيه مساجد في كل خطوط الطول تقريبًا، أول ما الأذان يخلص في مدينة بيبدأ في اللي بعدها، فالسلسلة ما بتتقطعش."],
    ],
    prayers: ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"],
    prayerDesc: ["أول ما السما تبدأ تنوّر قبل الشروق", "لما الشمس تعدّي أعلى نقطة في السما", "لما ضل أي حاجة يبقى قدّ طولها تقريبًا", "مع غروب الشمس على طول", "لما الشفق الأحمر يختفي والسما تضلم"],
    statsTitle: "الأرقام الحقيقية",
    statsPre: "قناة", channel: "وشلون؟", statsPost: "حسبت كل ثانية في سنة ٢٠٢٦ على أكثر من ٤٨٨ ألف مسجد، وده اللي طلع معاهم:",
    stats: ["ثانية في السنة كلها من غير أذان", "مسجد بيأذّن في نفس اللحظة في المتوسط", "مسجد أذّنوا مع بعض في ثانية واحدة في أبريل", "مسجد دخلوا في الحسبة"],
    footer: (n) => `المواقيت هنا محسوبة فلكيًا من مكان الشمس، وكل بلد بالطريقة الرسمية المعتمدة عندها تقريبًا، وممكن تختلف دقيقة أو اتنين عن التقويم الرسمي. على الخريطة ${n} مدينة كأمثلة، مش كل المساجد، والخطوط محسوبة بمعايير رابطة العالم الإسلامي. حدود الدول من خريطة ECharts المفتوحة (Apache-2.0). الفكرة مأخوذة من فيديو قناة وشلون؟.`,
    yourCity: "مدينتك", searchPh: "دوّر على مدينة…", searchAria: "اختار مدينة", notFound: "مش لاقيين المدينة دي",
    nextAdhan: "الأذان الجاي", upcomingNote: "المواعيد الجاية بتوقيت جهازك",
    onAir: "على الهوا", onAirSub: "آخر الأذانات حوالين العالم", onAirSubTL: "في الوقت المتسرّع",
    in: (d) => `بعد ${d}`, ago: (d) => `من ${d}`, and: " و",
    lastAdhan: "آخر أذان", nextOne: "الجاي", tapToPick: "اضغط عشان تختارها",
    canvasAria: "كرة أرضية بتوضح أماكن الأذان دلوقتي", language: "اللغة",
  },
  en: {
    title: "Adhan Around the World",
    metaTitle: "Adhan Around the World — Live",
    share: "Share", copied: "Link copied — send it to your friends", copyFail: "Copy the link from the address bar",
    live: "Live now", paused: "Paused", tlPill: "A whole day in a minute",
    h1a: "The adhan never stops,", h1b: "not even for a second",
    lead: "As the Earth turns, each prayer time moves from one city to the next without ever pausing. The colored lines on the globe show where the adhan has reached right now.",
    nowPre: "Right now the adhan is being called in", nowPost: (n) => (n === 1 ? "city on the map" : "cities on the map"),
    nextIn: (c, p, d) => `Next adhan: ${c} (${p}) ${d}`,
    tlBtn: "Watch a whole day in a minute", resume: "Resume", pause: "Pause", backLive: "Back to live",
    deviceTime: "your device's time",
    globe: "Globe", map: "Map", spinOn: "Auto-rotating", spinOff: "Rotation off",
    landFail: "Couldn't load country borders, but prayer times still work", landLoading: "Loading the map…",
    sun: "Sun",
    dragHint: "Drag the globe to spin it, tap any dot to pick that city", tapHint: "Tap any dot to pick that city",
    howTitle: "How does this happen?",
    steps: [
      ["The Earth turns", "Every 24 hours the Earth makes a full turn, so the sun appears to pass over cities one after another, from east to west."],
      ["Prayers follow the sun", "Each prayer is tied to a moment in the sun's position: first light, its highest point, sunset… so its time moves along with the sun."],
      ["Mosques everywhere", "Because there are mosques at almost every longitude, as soon as the adhan ends in one city it begins in the next, so the chain never breaks."],
    ],
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
    prayerDesc: ["When the sky starts to brighten before sunrise", "Just after the sun passes its highest point", "When a shadow is about as long as the object", "Right at sunset", "When the red twilight fades and the sky turns dark"],
    statsTitle: "The real numbers",
    statsPre: "The", channel: "Weshloon", statsPost: "channel calculated every second of 2026 across more than 488,000 mosques. Here's what they found:",
    stats: ["seconds in the whole year without an adhan", "mosques calling the adhan at the same moment, on average", "mosques calling it together in one second in April", "mosques included in the calculation"],
    footer: (n) => `Times here are calculated astronomically from the sun's position, using roughly each country's official method, and may differ by a minute or two from local calendars. The map shows ${n} sample cities, not every mosque; the lines use Muslim World League angles. Country borders from the open ECharts world map (Apache-2.0). Inspired by a video from the Weshloon channel.`,
    yourCity: "Your city", searchPh: "Search for a city…", searchAria: "Choose a city", notFound: "No city found",
    nextAdhan: "Next adhan", upcomingNote: "Upcoming times in your device's time",
    onAir: "On air", onAirSub: "Latest adhans around the world", onAirSubTL: "In fast-forward time",
    in: (d) => `in ${d}`, ago: (d) => `${d} ago`, and: " ",
    lastAdhan: "Last adhan", nextOne: "Next", tapToPick: "Tap to select",
    canvasAria: "Globe showing where the adhan is happening now", language: "Language",
  },
  fr: {
    title: "L'adhan autour du monde",
    metaTitle: "L'adhan autour du monde — En direct",
    share: "Partager", copied: "Lien copié, envoyez-le à vos amis", copyFail: "Copiez le lien depuis la barre d'adresse",
    live: "En direct", paused: "En pause", tlPill: "Une journée en une minute",
    h1a: "L'adhan ne s'arrête jamais,", h1b: "pas même une seconde",
    lead: "La Terre tourne, et l'heure de chaque prière passe d'une ville à l'autre sans jamais s'interrompre. Les lignes colorées sur le globe montrent jusqu'où l'adhan est arrivé en ce moment.",
    nowPre: "En ce moment, l'adhan retentit dans", nowPost: (n) => (n === 1 ? "ville de la carte" : "villes de la carte"),
    nextIn: (c, p, d) => `Prochain adhan : ${c} (${p}) ${d}`,
    tlBtn: "Voir une journée en une minute", resume: "Reprendre", pause: "Pause", backLive: "Retour au direct",
    deviceTime: "heure de votre appareil",
    globe: "Globe", map: "Carte", spinOn: "Rotation auto", spinOff: "Rotation arrêtée",
    landFail: "Impossible de charger les frontières, mais les horaires fonctionnent", landLoading: "Chargement de la carte…",
    sun: "Soleil",
    dragHint: "Faites glisser le globe pour le tourner, touchez un point pour choisir la ville", tapHint: "Touchez un point pour choisir la ville",
    howTitle: "Comment est-ce possible ?",
    steps: [
      ["La Terre tourne", "En 24 heures, la Terre fait un tour complet : le soleil semble passer au-dessus des villes l'une après l'autre, d'est en ouest."],
      ["Les prières suivent le soleil", "Chaque prière correspond à une position du soleil : l'aube, le zénith, le coucher… son heure se déplace donc avec le soleil."],
      ["Des mosquées partout", "Comme il y a des mosquées sur presque toutes les longitudes, dès que l'adhan finit dans une ville, il commence dans la suivante : la chaîne ne se rompt jamais."],
    ],
    prayers: ["Fajr", "Dhohr", "Asr", "Maghrib", "Icha"],
    prayerDesc: ["Quand le ciel commence à s'éclaircir avant le lever du soleil", "Juste après le passage du soleil au zénith", "Quand l'ombre d'un objet égale à peu près sa taille", "Au coucher du soleil", "Quand le crépuscule rouge disparaît et que le ciel s'assombrit"],
    statsTitle: "Les vrais chiffres",
    statsPre: "La chaîne", channel: "Weshloon", statsPost: "a calculé chaque seconde de 2026 pour plus de 488 000 mosquées. Voici ce qu'elle a trouvé :",
    stats: ["seconde dans toute l'année sans adhan", "mosquées appellent à la prière au même instant, en moyenne", "mosquées ensemble en une seule seconde en avril", "mosquées incluses dans le calcul"],
    footer: (n) => `Les horaires sont calculés astronomiquement à partir de la position du soleil, selon à peu près la méthode officielle de chaque pays, et peuvent différer d'une ou deux minutes des calendriers locaux. La carte montre ${n} villes d'exemple, pas toutes les mosquées ; les lignes utilisent les angles de la Ligue islamique mondiale. Frontières issues de la carte ouverte ECharts (Apache-2.0). Inspiré d'une vidéo de la chaîne Weshloon.`,
    yourCity: "Votre ville", searchPh: "Rechercher une ville…", searchAria: "Choisir une ville", notFound: "Aucune ville trouvée",
    nextAdhan: "Prochain adhan", upcomingNote: "Prochains horaires, à l'heure de votre appareil",
    onAir: "En direct", onAirSub: "Derniers adhans dans le monde", onAirSubTL: "En accéléré",
    in: (d) => `dans ${d}`, ago: (d) => `il y a ${d}`, and: " ",
    lastAdhan: "Dernier adhan", nextOne: "Prochain", tapToPick: "Touchez pour choisir",
    canvasAria: "Globe montrant où l'adhan retentit maintenant", language: "Langue",
  },
  tr: {
    title: "Dünya Çevresinde Ezan",
    metaTitle: "Dünya Çevresinde Ezan — Canlı",
    share: "Paylaş", copied: "Bağlantı kopyalandı, arkadaşlarına gönder", copyFail: "Bağlantıyı adres çubuğundan kopyala",
    live: "Şu an canlı", paused: "Durduruldu", tlPill: "Bir gün bir dakikada",
    h1a: "Ezan hiç susmuyor,", h1b: "bir saniye bile",
    lead: "Dünya döndükçe her namaz vakti bir şehirden diğerine hiç durmadan geçer. Küre üzerindeki renkli çizgiler, ezanın şu anda nereye ulaştığını gösterir.",
    nowPre: "Şu anda ezan okunuyor:", nowPost: () => "şehir (haritada)",
    nextIn: (c, p, d) => `Sıradaki ezan: ${c} (${p}) ${d}`,
    tlBtn: "Bir günü bir dakikada izle", resume: "Devam", pause: "Durdur", backLive: "Canlıya dön",
    deviceTime: "cihazınızın saatiyle",
    globe: "Küre", map: "Harita", spinOn: "Otomatik dönüyor", spinOff: "Dönme kapalı",
    landFail: "Ülke sınırları yüklenemedi, ama vakitler çalışıyor", landLoading: "Harita yükleniyor…",
    sun: "Güneş",
    dragHint: "Küreyi döndürmek için sürükle, şehri seçmek için bir noktaya dokun", tapHint: "Şehri seçmek için bir noktaya dokun",
    howTitle: "Bu nasıl oluyor?",
    steps: [
      ["Dünya dönüyor", "Dünya her 24 saatte bir tam tur atar; Güneş şehirlerin üzerinden doğudan batıya birbiri ardına geçiyormuş gibi görünür."],
      ["Namaz Güneş'e bağlı", "Her namaz Güneş'in belirli bir konumuna bağlıdır: şafak, en yüksek nokta, gün batımı… bu yüzden vakit Güneş'le birlikte ilerler."],
      ["Her yerde cami var", "Neredeyse her boylamda cami olduğu için bir şehirde ezan biter bitmez bir sonrakinde başlar; zincir hiç kopmaz."],
    ],
    prayers: ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"],
    prayerDesc: ["Gün doğmadan gökyüzü aydınlanmaya başlayınca", "Güneş en yüksek noktayı geçtikten hemen sonra", "Bir cismin gölgesi kendi boyu kadar olunca", "Güneş batar batmaz", "Kızıl şafak kaybolup hava kararınca"],
    statsTitle: "Gerçek rakamlar",
    statsPre: "", channel: "Weshloon", statsPost: "kanalı 2026 yılının her saniyesini 488 binden fazla cami için hesapladı. Sonuçlar:",
    stats: ["saniye — yıl boyunca ezansız geçen süre", "cami ortalama olarak aynı anda ezan okuyor", "cami nisan ayında tek bir saniyede birlikte okudu", "cami hesaba dahil edildi"],
    footer: (n) => `Vakitler Güneş'in konumuna göre astronomik olarak, her ülkenin yaklaşık resmi yöntemiyle hesaplanır ve resmi takvimden bir iki dakika farklı olabilir. Haritada tüm camiler değil, örnek olarak ${n} şehir var; çizgiler Dünya İslam Birliği açılarını kullanır. Ülke sınırları açık ECharts dünya haritasından (Apache-2.0). Weshloon kanalının bir videosundan ilham alınmıştır.`,
    yourCity: "Şehrin", searchPh: "Şehir ara…", searchAria: "Şehir seç", notFound: "Şehir bulunamadı",
    nextAdhan: "Sıradaki ezan", upcomingNote: "Sıradaki vakitler, cihazınızın saatiyle",
    onAir: "Yayında", onAirSub: "Dünyadaki son ezanlar", onAirSubTL: "Hızlandırılmış zamanda",
    in: (d) => `${d} sonra`, ago: (d) => `${d} önce`, and: " ",
    lastAdhan: "Son ezan", nextOne: "Sıradaki", tapToPick: "Seçmek için dokun",
    canvasAria: "Ezanın şu an okunduğu yerleri gösteren küre", language: "Dil",
  },
  id: {
    title: "Azan Keliling Dunia",
    metaTitle: "Azan Keliling Dunia — Langsung",
    share: "Bagikan", copied: "Tautan disalin, kirim ke temanmu", copyFail: "Salin tautan dari bilah alamat",
    live: "Langsung", paused: "Dijeda", tlPill: "Sehari dalam semenit",
    h1a: "Azan tak pernah berhenti,", h1b: "walau sedetik",
    lead: "Bumi berputar, sehingga waktu setiap salat berpindah dari satu kota ke kota berikutnya tanpa henti. Garis berwarna di bola dunia menunjukkan sampai mana azan telah tiba saat ini.",
    nowPre: "Saat ini azan berkumandang di", nowPost: () => "kota di peta",
    nextIn: (c, p, d) => `Azan berikutnya: ${c} (${p}) ${d}`,
    tlBtn: "Lihat sehari penuh dalam semenit", resume: "Lanjutkan", pause: "Jeda", backLive: "Kembali ke langsung",
    deviceTime: "waktu perangkat Anda",
    globe: "Bola dunia", map: "Peta", spinOn: "Berputar otomatis", spinOff: "Putaran mati",
    landFail: "Batas negara gagal dimuat, tapi waktu salat tetap berjalan", landLoading: "Memuat peta…",
    sun: "Matahari",
    dragHint: "Geser bola dunia untuk memutarnya, ketuk titik untuk memilih kota", tapHint: "Ketuk titik untuk memilih kota",
    howTitle: "Bagaimana ini terjadi?",
    steps: [
      ["Bumi berputar", "Setiap 24 jam Bumi berputar penuh, sehingga matahari tampak melewati kota satu per satu dari timur ke barat."],
      ["Salat mengikuti matahari", "Setiap salat terkait posisi matahari: fajar, titik tertinggi, terbenam… jadi waktunya bergerak bersama matahari."],
      ["Masjid di mana-mana", "Karena ada masjid di hampir setiap garis bujur, begitu azan selesai di satu kota, azan dimulai di kota berikutnya, sehingga rantainya tak pernah putus."],
    ],
    prayers: ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"],
    prayerDesc: ["Saat langit mulai terang sebelum matahari terbit", "Tepat setelah matahari melewati titik tertinggi", "Saat bayangan benda kira-kira sepanjang bendanya", "Tepat saat matahari terbenam", "Saat mega merah hilang dan langit gelap"],
    statsTitle: "Angka sebenarnya",
    statsPre: "Kanal", channel: "Weshloon", statsPost: "menghitung setiap detik tahun 2026 untuk lebih dari 488 ribu masjid. Hasilnya:",
    stats: ["detik sepanjang tahun tanpa azan", "masjid mengumandangkan azan bersamaan, rata-rata", "masjid bersamaan dalam satu detik di bulan April", "masjid masuk dalam perhitungan"],
    footer: (n) => `Waktu di sini dihitung secara astronomis dari posisi matahari, kira-kira dengan metode resmi tiap negara, dan bisa berbeda satu-dua menit dari jadwal resmi. Peta menampilkan ${n} kota sebagai contoh, bukan semua masjid; garis memakai sudut Liga Muslim Dunia. Batas negara dari peta dunia terbuka ECharts (Apache-2.0). Terinspirasi dari video kanal Weshloon.`,
    yourCity: "Kotamu", searchPh: "Cari kota…", searchAria: "Pilih kota", notFound: "Kota tidak ditemukan",
    nextAdhan: "Azan berikutnya", upcomingNote: "Jadwal berikutnya dalam waktu perangkat Anda",
    onAir: "Mengudara", onAirSub: "Azan terbaru di seluruh dunia", onAirSubTL: "Dalam waktu dipercepat",
    in: (d) => `${d} lagi`, ago: (d) => `${d} lalu`, and: " ",
    lastAdhan: "Azan terakhir", nextOne: "Berikutnya", tapToPick: "Ketuk untuk memilih",
    canvasAria: "Bola dunia yang menunjukkan tempat azan sedang berkumandang", language: "Bahasa",
  },
  ur: {
    title: "دنیا بھر میں اذان",
    metaTitle: "دنیا بھر میں اذان — براہِ راست",
    share: "شیئر کریں", copied: "لنک کاپی ہو گیا، دوستوں کو بھیجیں", copyFail: "ایڈریس بار سے لنک کاپی کریں",
    live: "ابھی براہِ راست", paused: "رکا ہوا", tlPill: "پورا دن ایک منٹ میں",
    h1a: "اذان کبھی نہیں رکتی،", h1b: "ایک سیکنڈ کے لیے بھی نہیں",
    lead: "زمین گھومتی ہے، اس لیے ہر نماز کا وقت ایک شہر سے دوسرے شہر تک بغیر رکے منتقل ہوتا رہتا ہے۔ کرے پر رنگین لکیریں دکھاتی ہیں کہ اس لمحے اذان کہاں تک پہنچی ہے۔",
    nowPre: "اس وقت اذان ہو رہی ہے", nowPost: () => "شہروں میں (نقشے پر)",
    nextIn: (c, p, d) => `اگلی اذان: ${c} (${p}) ${d}`,
    tlBtn: "پورا دن ایک منٹ میں دیکھیں", resume: "جاری رکھیں", pause: "روکیں", backLive: "براہِ راست پر واپس",
    deviceTime: "آپ کے آلے کے وقت کے مطابق",
    globe: "کرہ", map: "نقشہ", spinOn: "خودکار گردش", spinOff: "گردش بند",
    landFail: "ملکوں کی سرحدیں لوڈ نہیں ہو سکیں، لیکن اوقات کام کر رہے ہیں", landLoading: "نقشہ لوڈ ہو رہا ہے…",
    sun: "سورج",
    dragHint: "کرے کو گھمانے کے لیے کھینچیں، شہر چننے کے لیے کسی نقطے پر ٹیپ کریں", tapHint: "شہر چننے کے لیے کسی نقطے پر ٹیپ کریں",
    howTitle: "یہ کیسے ہوتا ہے؟",
    steps: [
      ["زمین گھومتی ہے", "ہر 24 گھنٹے میں زمین ایک مکمل چکر لگاتی ہے، اس لیے سورج مشرق سے مغرب تک ایک کے بعد ایک شہر پر سے گزرتا نظر آتا ہے۔"],
      ["نماز سورج سے جڑی ہے", "ہر نماز سورج کی ایک خاص حالت سے جڑی ہے: صبح کی روشنی، بلند ترین مقام، غروب… اس لیے اس کا وقت سورج کے ساتھ چلتا ہے۔"],
      ["ہر جگہ مسجدیں", "تقریباً ہر طولِ بلد پر مسجدیں ہیں، اس لیے ایک شہر میں اذان ختم ہوتے ہی اگلے میں شروع ہو جاتی ہے اور سلسلہ کبھی نہیں ٹوٹتا۔"],
    ],
    prayers: ["فجر", "ظہر", "عصر", "مغرب", "عشاء"],
    prayerDesc: ["طلوعِ آفتاب سے پہلے جب آسمان روشن ہونے لگے", "سورج کے بلند ترین مقام سے گزرنے کے فوراً بعد", "جب کسی چیز کا سایہ تقریباً اس کے برابر ہو", "سورج غروب ہوتے ہی", "جب سرخ شفق غائب ہو جائے اور اندھیرا چھا جائے"],
    statsTitle: "اصل اعداد و شمار",
    statsPre: "", channel: "Weshloon", statsPost: "چینل نے 2026 کے ہر سیکنڈ کا حساب 4 لاکھ 88 ہزار سے زیادہ مساجد پر لگایا۔ نتیجہ یہ نکلا:",
    stats: ["سیکنڈ پورے سال میں بغیر اذان کے", "مساجد اوسطاً ایک ہی لمحے میں اذان دیتی ہیں", "مساجد نے اپریل میں ایک ہی سیکنڈ میں اذان دی", "مساجد حساب میں شامل"],
    footer: (n) => `یہاں اوقات سورج کی پوزیشن سے فلکیاتی طور پر، ہر ملک کے سرکاری طریقے کے قریب حساب کیے گئے ہیں اور سرکاری کیلنڈر سے ایک دو منٹ مختلف ہو سکتے ہیں۔ نقشے پر ${n} شہر بطور مثال ہیں، تمام مساجد نہیں؛ لکیریں رابطہ عالم اسلامی کے زاویوں پر ہیں۔ ملکوں کی سرحدیں ECharts کے کھلے نقشے سے (Apache-2.0)۔ Weshloon چینل کی ایک ویڈیو سے متاثر۔`,
    yourCity: "آپ کا شہر", searchPh: "شہر تلاش کریں…", searchAria: "شہر منتخب کریں", notFound: "کوئی شہر نہیں ملا",
    nextAdhan: "اگلی اذان", upcomingNote: "اگلے اوقات آپ کے آلے کے وقت کے مطابق",
    onAir: "براہِ راست", onAirSub: "دنیا بھر کی تازہ اذانیں", onAirSubTL: "تیز رفتار وقت میں",
    in: (d) => `${d} میں`, ago: (d) => `${d} پہلے`, and: " ",
    lastAdhan: "آخری اذان", nextOne: "اگلی", tapToPick: "منتخب کرنے کے لیے ٹیپ کریں",
    canvasAria: "کرہ جو دکھاتا ہے کہ اس وقت اذان کہاں ہو رہی ہے", language: "زبان",
  },
};

export function detectLang() {
  const ok = (c) => LANGS.some((l) => l.code === c);
  try { const h = location.hash.replace("#", ""); if (ok(h)) return h; } catch (e) {}
  try { const s = localStorage.getItem("adhan-lang"); if (ok(s)) return s; } catch (e) {}
  try {
    for (const l of navigator.languages || [navigator.language]) { const c = (l || "").slice(0, 2).toLowerCase(); if (ok(c)) return c; }
  } catch (e) {}
  return "ar";
}

export function makeI18n(code) {
  const L = LANGS.find((l) => l.code === code) || LANGS[0];
  const t = D[L.code];
  const loc = L.locale;
  const nf = new Intl.NumberFormat(loc);
  const unit = (u) => new Intl.NumberFormat(loc, { style: "unit", unit: u, unitDisplay: "long" });
  const uS = unit("second"), uM = unit("minute"), uH = unit("hour");
  const dur = (ms) => {
    const s = Math.round(Math.abs(ms) / 1000);
    if (s < 60) return uS.format(s);
    const m = Math.floor(s / 60);
    if (m < 60) return uM.format(m);
    const h = Math.floor(m / 60);
    return uH.format(h) + (m % 60 ? t.and + uM.format(m % 60) : "");
  };
  const latin = L.code !== "ar" && L.code !== "ur";
  return {
    ...L, t, nf,
    compact: new Intl.NumberFormat(loc, { notation: "compact" }),
    fmtTime: new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit" }),
    fmtClock: new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit", second: "2-digit" }),
    fmtDay: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long" }),
    inn: (ms) => t.in(dur(ms)),
    ago: (ms) => t.ago(dur(ms)),
    city: (i) => (latin ? CITY_NAMES_LATIN[i] : CITIES[i][0]),
    prayer: (i) => t.prayers[i],
    video: VIDEO,
  };
}

export const I18n = createContext(makeI18n("ar"));
export const useI18n = () => useContext(I18n);
