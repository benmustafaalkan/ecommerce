# Tekstil AI Fotoğraf Stüdyosu — PRD v2.0

**Fal.ai Nano Banana Pro Destekli Kişisel E-Ticaret Görsel Üretim Aracı**

| | |
|---|---|
| **Versiyon** | 2.0 (Nihai) |
| **Tarih** | 11 Nisan 2026 |
| **Platform** | Cloudflare Pages + Functions |
| **AI Backend** | Fal.ai Nano Banana Pro/Edit |
| **Kullanıcı Kapsamı** | Tek kullanıcı (kişisel) |

---

## 1. Ürün Özeti ve Amaç

Bu uygulama, e-ticaret danışmanlığı kapsamında müşteri tekstil ürünlerinin ham fotoğraflarını profesyonel lifestyle görsellere dönüştürmek için tasarlanmış, tek kullanıcıya yönelik, masaüstü odaklı bir web aracıdır.

### 1.1 Temel Değer Önermesi

- Ham ürün fotoğrafındaki ortam ışığı yanılsamasını zorunlu beyaz dengesi kalibrasyonu ile sıfırlama
- Kalibre edilmiş görüntüyü Fal.ai Nano Banana Pro/Edit API'si üzerinden gerçekçi yaşam tarzı sahnelere yerleştirme
- Kumaş dokusu, formu ve doğru renk bütünlüğünü koruma
- Sonuçları doğrudan yerel cihaza indirme (bulut depolama yok)

### 1.2 Kapsam Dışı (Kesinlikle Yapılmayacaklar)

- Üyelik sistemi, login ekranı, şifre yönetimi, kullanıcı veritabanı
- Geçmiş üretimleri saklayan galeri veya bulut depolama entegrasyonu
- Mobil responsive tasarım (yalnızca desktop)
- HEIC dosya formatı desteği
- Batch/toplu işlem (v1 kapsamında değil)

---

## 2. Teknik Mimari

### 2.1 Sistem Mimarisi Genel Bakış

Uygulama iki katmandan oluşur:

| Katman | Teknoloji | Sorumluluk |
|---|---|---|
| **Frontend** | React 18+ (Vite) + Tailwind CSS | UI, Canvas işlemleri, beyaz dengesi kalibrasyonu, state yönetimi, dosya yükleme/indirme |
| **Backend (Proxy)** | Cloudflare Pages Functions | Fal.ai API key'ini gizleme, API isteklerini proxy'leme, CORS yönetimi |

### 2.2 Cloudflare Pages Yapılandırması

#### Dizin Yapısı

```
project-root/
├── src/                     # React uygulama kaynağı
│   ├── components/          # UI bileşenleri
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── constants/           # Prompt şablonları, sabitler
│   └── App.tsx
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       ├── generate.ts      # Fal.ai görüntü üretim proxy
│       └── upload.ts        # Fal.ai storage yükleme proxy
├── public/
├── package.json
├── vite.config.ts
└── wrangler.toml
```

#### Environment Variables (Cloudflare Dashboard)

| Değişken | Açıklama | Tip |
|---|---|---|
| `FAL_KEY` | Fal.ai API anahtarı | Secret (encrypted) |

#### Pages Function Örneği: `/functions/api/generate.ts`

```typescript
export async function onRequestPost(context) {
  const { FAL_KEY } = context.env;
  const body = await context.request.json();

  const response = await fetch(
    "https://queue.fal.run/fal-ai/nano-banana-pro/edit",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${FAL_KEY}`
      },
      body: JSON.stringify(body)
    }
  );

  return new Response(await response.text(), {
    headers: { "Content-Type": "application/json" }
  });
}
```

> **Güvenlik Notu:** FAL_KEY kesinlikle frontend kodunda yer almaz. Tüm Fal.ai istekleri `/functions/api/*` üzerinden proxy edilir. Cloudflare Dashboard > Settings > Environment Variables bölümünden Secret olarak tanımlanır.

---

## 3. Fal.ai API Entegrasyonu

### 3.1 Kullanılacak Endpoint

| Parametre | Değer |
|---|---|
| **Endpoint** | `fal-ai/nano-banana-pro/edit` |
| **Model** | Google Gemini 3 Pro Image (Nano Banana Pro) |
| **Maliyet** | $0.15 / üretim (1K), $0.30 / üretim (4K) |
| **Yaklaşım** | Semantik düzenleme — mask, ControlNet, depth map GEREKTIRMEZ |
| **Girdi** | `prompt` (string) + `image_urls` (array, maks 2 görüntü) |
| **Çıktı** | `images` (array) + `description` (string) |

### 3.2 API Input Schema

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `prompt` | string | **Evet** | Görsel düzenleme prompt'u |
| `image_urls` | string[] | **Evet** | Kaynak görüntü URL'leri (maks 2) |
| `aspect_ratio` | enum | Hayır | `auto`, `1:1`, `4:5`, `3:4`, `2:3`, `9:16`, `16:9`, `3:2`, `4:3`, `5:4`, `21:9` |
| `resolution` | enum | Hayır | `1K` (varsayılan), `2K`, `4K` |
| `output_format` | enum | Hayır | `png` (varsayılan), `jpeg`, `webp` |
| `num_images` | integer | Hayır | Varsayılan: 1. Tek istekte çoklu varyasyon için kullanılır. |
| `seed` | integer | Hayır | Tekrarlanabilir sonuçlar için sabit tohum değeri |
| `safety_tolerance` | enum | Hayır | 1 (en katı) – 6 (en gevşek). Varsayılan: 4 |

### 3.3 Örnek API İsteği

```json
{
  "prompt": "Place this folded cotton t-shirt on a light oak wooden table in a minimalist Scandinavian living room. Soft morning light from a large window on the left. Preserve exact fabric texture, folds, wrinkles and stitching. Natural contact shadow. Professional e-commerce lifestyle photography. 50mm lens.",
  "image_urls": ["https://fal.storage/uploaded-image-url.png"],
  "aspect_ratio": "1:1",
  "resolution": "1K",
  "output_format": "png",
  "num_images": 1
}
```

### 3.4 Görüntü Yükleme Stratejisi

Kalibre edilmiş görüntü, API'ye gönderilmeden önce Fal.ai Storage'a yüklenmelidir. İki yöntem desteklenir:

- **Base64 Data URI:** Küçük dosyalar için uygun (<5 MB). Canvas'tan `toDataURL()` ile alınır ve doğrudan `image_urls`'e geçilir.
- **Fal.ai Storage Upload:** Büyük dosyalar için önerilir. `fal.storage.upload(file)` ile yüklenir, dönen URL `image_urls`'e eklenir. Bu işlem de `/functions/api/upload.ts` üzerinden proxy edilmelidir.

> **Maliyet Tahmini:** Ortalama senaryo: 30 ürün × 2 deneme × 1 görüntü = 60 üretim × $0.15 = **$9/müşteri**. Eğer 3 varyasyon üretilirse: 60 × 3 × $0.15 = **$27/müşteri**. Maliyeti kontrol altında tutmak için varsayılan olarak 1 üretim yapılır, kullanıcı isterse ek varyasyon talep eder.

---

## 4. Kullanıcı Arayüzü ve Uygulama Akışı

Uygulama, tek sayfa (SPA) üzerinde doğrusal 4 adımlı bir akışa sahiptir. Her adım tamamlanmadan bir sonrakine geçilemez.

### Adım 1: Fotoğraf Yükleme

#### UI Bileşenleri

- Ekranın ortasında büyük bir sürükle-bırak (Drag & Drop) alanı
- Alternatif olarak "Dosya Seç" butonu
- Yükleme sırasında progress bar
- Yüklenen görüntünün önizlemesi

#### Teknik Gereksinimler

| Kural | Detay |
|---|---|
| Maksimum dosya boyutu | 20 MB |
| Desteklenen formatlar | JPG, JPEG, PNG, WEBP |
| Validasyon | Dosya tipi ve boyut kontrolü yükleme anında yapılır. Uyumsuz dosyalarda hata mesajı gösterilir. |
| Canvas yükleme | Görüntü HTML5 Canvas'a çizilir. Orijinal piksel verisi korunur. |

### Adım 2: Zorunlu Renk Kalibrasyonu (Beyaz Dengesi)

> **⚠️ ZORUNLU ADIM:** Bu adım atlanamaz. Beyaz dengesi kalibrasyonu yapılmadan bir sonraki adıma geçiş engellenir. "Devam" butonu pasif (disabled) kalır.

#### UI Bileşenleri

- Uyarı metni: "Lütfen fotoğraftaki beyaz referans noktasına tıklayın"
- Fare imleci damlalık (eyedropper) aracına dönüşür
- İmlecin yanında, pikselleri yakınlaştıran 5×5 büyüteç (magnifier loupe) bileşeni
- Tıklanan noktanın RGB değeri ekranda gösterilir
- Kalibrasyon sonrası öncesi/sonrası (before/after) karşılaştırma görünümü (slider ile)
- "Bu doğru görünüyor mu?" onay butonu
- "Tekrar Seç" butonu (yanlış noktaya tıklandıysa)

#### Kalibrasyon Algoritması (Client-Side Canvas)

Aşağıdaki işlem tamamen tarayıcıda, Canvas 2D API ile gerçekleşir:

**1. Referans noktası okuma:** Kullanıcının tıkladığı noktanın etrafındaki 3×3 piksellik alanın ortalama RGB değeri hesaplanır → `[R_ref, G_ref, B_ref]`

**2. Validasyon kontrolü:** Eğer herhangi bir kanal < 80 ise kullanıcıya "Bu nokta yeterince açık değil, lütfen beyaz veya açık gri bir alan seçin" uyarısı gösterilir. İşlem devam etmez.

**3. Çarpan hesaplama:**

```
C_red   = 255 / R_ref
C_green = 255 / G_ref
C_blue  = 255 / B_ref
```

**4. Piksel dönüşümü:** Canvas ImageData üzerindeki her piksel için:

```
R_yeni = Math.min(255, Math.round(R_eski * C_red))
G_yeni = Math.min(255, Math.round(G_eski * C_green))
B_yeni = Math.min(255, Math.round(B_eski * C_blue))
```

**5. Clipping koruması:** `Math.min(255, ...)` ile değerlerin 0–255 aralığında kalması garanti edilir.

**6. Sonuç çıktısı:** Kalibre edilmiş görüntü Canvas'ta güncellenir. `canvas.toBlob()` veya `toDataURL()` ile Blob/Base64 olarak alınır.

### Adım 3: Parametre Seçimi ve Prompt Oluşturma

#### UI Layout

Ekran ikiye bölünür:

- **Sol panel:** Kalibre edilmiş görüntünün önizlemesi
- **Sağ panel:** Parametre seçim kontrolleri

#### Parametre Kontrolleri

| Kontrol | Tip | Seçenekler |
|---|---|---|
| **Ürün Formu** | Dropdown (select) | Katlı, Askıda, Düz Zemin, Manken Üzerinde, Giyilmiş (flat lay) |
| **Sahne Stili** | Dropdown (select) | Minimalist Studio, Skandinav Ev, Kahve Dükkanı, Doğa/Outdoor, Otel Odası, Ofis, Loft, Plaj |
| **Çıktı Oranı** | Radio/Segmented | 1:1 (Kare), 4:5 (Instagram), 3:4 (Dikey), 9:16 (Story), 16:9 (Yatay) |
| **Çözünürlük** | Radio/Segmented | 1K (varsayılan), 2K, 4K (2× maliyet) |
| **Çıktı Formatı** | Dropdown | PNG (varsayılan), JPEG, WEBP |
| **Özel İstek** | Textarea (opsiyonel) | Serbest metin: "Yanında kahve fincanı olsun", "Sıcak tonlarda ışık" vb. |

---

## 5. Prompt Mühendisliği

Bu bölüm uygulamanın en kritik parçasıdır. Nano Banana Pro/Edit modeli ControlNet veya mask kullanmadığı için, kumaş dokusunun ve renginin korunması tamamen prompt kalitesine bağlıdır.

### 5.1 Prompt Şablon Yapısı

Sistem, kullanıcının seçimlerine göre aşağıdaki şablon üzerinden dinamik prompt oluşturur:

```typescript
const buildPrompt = (params) => {
  const base = `Place this ${params.productForm} textile product`;
  const scene = `${params.sceneDescription}.`;
  const preserve = `Preserve exact original fabric texture, weave pattern, folds, wrinkles, and stitching details with pixel-level accuracy. Maintain exact original color values — do not shift hue, saturation or tone.`;
  const lighting = `Realistic soft lighting consistent with the scene. Natural contact shadow beneath the product.`;
  const style = `Professional e-commerce lifestyle photography, 50mm lens, shallow depth of field on background.`;
  const custom = params.customRequest
    ? ` ${params.customRequest}.` : "";
  return `${base} ${scene} ${preserve} ${lighting} ${style}${custom}`;
};
```

### 5.2 Sahne Stili Prompt Eşleştirme Tablosu

| Sahne Adı | Prompt Parçası (`sceneDescription`) |
|---|---|
| **Minimalist Studio** | `on a clean white surface in a minimalist photography studio with soft diffused lighting from above and a plain light gray background` |
| **Skandinav Ev** | `on a light oak wooden table in a bright Scandinavian living room with white walls, a large window casting soft morning light from the left, and minimal decor` |
| **Kahve Dükkanı** | `on a rustic dark wood cafe table next to a ceramic coffee cup, warm ambient lighting from pendant lamps overhead, blurred cafe interior in background` |
| **Doğa/Outdoor** | `laid on natural green grass in a sunlit garden, dappled sunlight filtering through tree leaves, soft bokeh nature background` |
| **Otel Odası** | `draped on a crisp white hotel bed with plush pillows, soft warm bedside lamp lighting, elegant neutral-toned hotel room interior` |
| **Loft** | `on a raw concrete surface in an industrial loft space with exposed brick walls, large steel-framed windows, warm afternoon sunlight` |
| **Plaj** | `on light sand with gentle ocean waves in the soft-focus background, golden hour warm sunlight, relaxed coastal atmosphere` |
| **Ofis** | `on a clean modern desk in a bright office space with minimalist decor, natural daylight from large windows, professional corporate setting` |

### 5.3 Ürün Formu Prompt Eşleştirme Tablosu

| Ürün Formu | Prompt Parçası (`productForm`) |
|---|---|
| **Katlı** | `neatly folded` |
| **Askıda** | `hanging on a wooden hanger` |
| **Düz Zemin** | `laid flat (flat lay)` |
| **Manken Üzerinde** | `worn on an invisible mannequin (ghost mannequin style)` |
| **Giyilmiş (Flat Lay)** | `styled in a flat lay arrangement with accessories` |

### 5.4 Kritik Prompt Kuralları

> **⚠️ Doku Koruma Zorunluluğu:** Her prompt'a mutlaka şu ifade eklenir: _"Preserve exact original fabric texture, weave pattern, folds, wrinkles, and stitching details with pixel-level accuracy. Maintain exact original color values."_ Bu ifade çıkarılamaz veya basitleştirilemez.

- Her prompt'a `natural contact shadow` ifadesi eklenir — ürünün sahneye "oturması" için kritik
- Prompt dili her zaman İngilizce olmalıdır — model İngilizce prompt'larda en iyi sonucu verir
- Kullanıcının Türkçe "Özel İstek" girmesi durumunda, bu metin prompt'un sonuna eklenir (model Türkçeyi kısmen anlar)
- Kamera açısı ve lens bilgisi (`50mm lens, shallow depth of field`) prompt'a dahil edilir
- Arka planın her zaman soft focus/bokeh olması istenir — ürünün ön plana çıkmasını sağlar

---

## 6. Üretim ve İndirme Akışı (Adım 4)

### 6.1 Üretim Süreci

Kullanıcı "Oluştur" butonuna bastığında aşağıdaki sıra izlenir:

1. **Görüntü hazırlama:** Kalibre edilmiş Canvas görüntüsü `canvas.toBlob()` ile Blob'a çevrilir.
2. **Upload:** Blob, `/api/upload` endpoint'i üzerinden Fal.ai Storage'a yüklenir. Dönen URL alınır.
3. **Prompt oluşturma:** Seçilen parametrelerle `buildPrompt()` fonksiyonu çağrılır.
4. **API isteği:** `/api/generate` endpoint'ine POST isteği atılır. Payload: `prompt`, `image_urls`, `aspect_ratio`, `resolution`, `output_format`.
5. **Bekleme:** Fal.ai queue sistemi kullanılır. UI'da animasyonlu loading göstergesi ile "Üretiliyor..." mesajı ve tahmini süre gösterilir.
6. **Sonuç gösterimi:** Üretilen görüntü ekranda gösterilir.

### 6.2 Varyasyon Yönetimi

Maliyet optimizasyonu için varsayılan üretim sayısı 1'dir. Kullanıcıya şu aksiyonlar sunulur:

- **"Yeniden Üret" butonu:** Aynı parametrelerle yeni bir üretim yapar (farklı seed ile).
- **"+2 Varyasyon" butonu:** Aynı parametrelerle 2 ek üretim yapar. Toplam 3 görüntü yan yana gösterilir.
- **Oturum içi geçmiş:** Aynı oturumda yapılan tüm üretimler sol sidebar'da küçük thumbnail olarak listelenir. Kullanıcı bunlara tıklayarak karşılaştırma yapabilir.

### 6.3 İndirme

- Her görüntünün üzerinde "İndir" butonu bulunur
- Dosya adı formatı: `urun-[sahneStili]-[oran]-[timestamp].png`
- İndirme işlemi, görüntü URL'sinden fetch ile alınıp Blob olarak oluşturulur ve `<a>` etiketiyle download tetiklenir
- Sayfa yenilenirse veya oturum kapanırsa tüm veriler kaybolur — kullanıcı bu konuda uyarılır

---

## 7. State Yönetimi

Uygulama state'i React Context veya Zustand ile yönetilir. Aşağıda global state yapısı:

```typescript
interface AppState {
  // Adım takibi
  currentStep: 1 | 2 | 3 | 4;

  // Adım 1: Yükleme
  originalImage: File | null;
  originalImageDataUrl: string | null;

  // Adım 2: Kalibrasyon
  calibrationPoint: { x: number; y: number } | null;
  referenceRGB: { r: number; g: number; b: number } | null;
  calibratedImageBlob: Blob | null;
  calibratedImageDataUrl: string | null;
  isCalibrated: boolean;

  // Adım 3: Parametreler
  productForm: ProductForm;
  sceneStyle: SceneStyle;
  aspectRatio: AspectRatio;
  resolution: '1K' | '2K' | '4K';
  outputFormat: 'png' | 'jpeg' | 'webp';
  customRequest: string;

  // Adım 4: Üretim
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  sessionHistory: GeneratedImage[];
  error: string | null;
}

type ProductForm =
  | 'folded' | 'hanging' | 'flat_lay'
  | 'mannequin' | 'styled_flat_lay';

type SceneStyle =
  | 'minimalist_studio' | 'scandinavian'
  | 'cafe' | 'outdoor' | 'hotel'
  | 'loft' | 'beach' | 'office';

type AspectRatio =
  | '1:1' | '4:5' | '3:4' | '9:16' | '16:9';
```

---

## 8. UI Bileşen Hiyerarşisi

```
<App>
  <Header />                          # Logo + adım göstergesi
  <StepIndicator />                   # 1-2-3-4 progress bar
  <MainContent>
    {step === 1 && <UploadStep />}
      <DropZone />                    # Sürükle-bırak alanı
      <FileValidator />               # Format/boyut kontrolü
    {step === 2 && <CalibrationStep />}
      <ImageCanvas />                 # HTML5 Canvas
      <EyedropperTool />              # Damlalık + büyüteç
      <MagnifierLoupe />              # 5x5 piksel yakınlaştırma
      <BeforeAfterSlider />           # Öncesi/sonrası karşılaştırma
      <RGBDisplay />                  # Seçilen noktanın RGB değeri
    {step === 3 && <ParameterStep />}
      <CalibratedPreview />           # Sol panel: önizleme
      <ParameterPanel />              # Sağ panel: seçimler
        <ProductFormSelect />
        <SceneStyleSelect />
        <AspectRatioSelector />
        <ResolutionSelector />
        <OutputFormatSelect />
        <CustomRequestInput />
    {step === 4 && <GenerationStep />}
      <GenerateButton />
      <LoadingIndicator />            # Animasyonlu bekleme
      <ResultGrid />                  # Üretilen görüntüler
        <ResultCard />                # Tek görüntü + indir butonu
      <VariationControls />           # Yeniden üret / +2 varyasyon
      <SessionSidebar />              # Oturum içi geçmiş
  </MainContent>
</App>
```

---

## 9. Hata Yönetimi

| Hata Senaryosu | Kullanıcıya Gösterilen Mesaj | Teknik Aksiyon |
|---|---|---|
| Dosya boyutu > 20 MB | "Dosya 20 MB'ı aşıyor. Lütfen daha küçük bir dosya seçin." | Yüklemeyi reddet, DropZone'a geri dön |
| Geçersiz dosya formatı | "Yalnızca JPG, PNG ve WEBP desteklenir." | `input accept` attribute + JS validasyonu |
| Kalibrasyon: Koyu nokta | "Seçilen nokta çok koyu. Beyaz/açık gri alan seçin." | RGB kanalları < 80 ise uyarı göster |
| Fal.ai API timeout | "Görsel üretimi zaman aşımına uğradı. Tekrar deneyin." | 60 sn timeout, retry butonu göster |
| Fal.ai API hatası (5xx) | "Sunucu hatası. Birkaç dakika sonra tekrar deneyin." | Hata detayını console'a logla |
| Fal.ai rate limit (429) | "Çok fazla istek. 30 saniye bekleyin." | 30 sn countdown göster, butonları devre dışı bırak |
| Görüntü içerik filtresi | "Görsel güvenlik filtresi nedeniyle üretilemedi. Farklı bir prompt deneyin." | `safety_tolerance` parametresi 4 olarak sabit |
| Ağ bağlantısı kesildi | "İnternet bağlantınız kesildi. Bağlantıyı kontrol edin." | `navigator.onLine` + fetch catch |

---

## 10. Performans ve Kısıtlar

### 10.1 Performans Hedefleri

| Metrik | Hedef |
|---|---|
| Sayfa yükleme süresi (FCP) | < 2 saniye |
| Canvas kalibrasyon işlemi | < 500ms (10 MP görüntü için) |
| Fal.ai API yanıt süresi | 10–30 saniye (model bağımlı) |
| Dosya yükleme (≤ 20 MB) | < 5 saniye (normal bağlantı) |

### 10.2 Bilinen Kısıtlar

- Nano Banana Pro/Edit modeli mask veya ControlNet girdisi kabul etmez. Doku koruması tamamen prompt kalitesine bağlıdır.
- Piksel bazlı çıktı boyutu kontrolü yoktur (1080×1080 gibi). Yalnızca 1K/2K/4K çözünürlük ve aspect ratio seçilebilir.
- API istek başına maksimum 2 referans görüntü gönderilebilir.
- Beyaz dengesi algoritması lineer çarpan tabanlıdır; karmaşık aydınlatma koşullarında (karma ışık kaynakları) yetersiz kalabilir.
- Oturum verisi tarayıcı belleğinde tutulur. Sayfa yenilemesi tüm verileri siler.

### 10.3 Gelecek İterasyon Adayları (v2 Kapsamı)

- Batch/toplu işlem: Birden fazla ürün fotoğrafını sırayla işleme
- Eğer Nano Banana Pro tekstilde yetersiz kalırsa, FLUX + ControlNet tabanlı alternatif pipeline
- Fal.ai üzerinde özel LoRA modeli eğitimi (tekstile özel fine-tuning)
- Üretim sonrası post-processing: sharpening, color boost, kontrast ayarı
- Maskeleme kontrolü: Arka plan kaldırma sonrası manuel mask düzeltme fırçası

---

## 11. Deployment ve DevOps

### 11.1 Deployment Akışı

1. GitHub repository'sine kod push edilir.
2. Cloudflare Pages, GitHub entegrasyonu ile otomatik build tetikler.
3. Build komutu: `npm run build` (Vite build)
4. Output dizini: `dist/`
5. `/functions` dizinindeki dosyalar otomatik olarak Cloudflare Workers'a deploy edilir.

### 11.2 wrangler.toml Yapılandırması

```toml
[vars]
# Public değişkenler buraya (API key BURADA OLMAZ)

[env.production]
# Production-specific ayarlar

# FAL_KEY, Cloudflare Dashboard > Pages > Settings >
# Environment Variables > Production bölümünden
# Secret olarak eklenir.
```

### 11.3 Teknoloji Stackı Özeti

| Katman | Teknoloji | Versiyon / Not |
|---|---|---|
| UI Framework | React | 18+ |
| Build Tool | Vite | 5+ |
| Styling | Tailwind CSS | 3+ |
| State Management | Zustand veya React Context | Basit state için Context yeterli |
| Dil | TypeScript | 5+ |
| Hosting | Cloudflare Pages | Ücretsiz plan yeterli |
| Serverless | Cloudflare Pages Functions | Workers runtime |
| AI API | Fal.ai | `nano-banana-pro/edit` endpoint |
| Canvas | HTML5 Canvas 2D API | Native browser API |

---

> **🧪 Geliştirme Öncesi Zorunlu Test:** Kod yazmaya başlamadan önce, Fal.ai Playground'da (ücretsiz deneme kredisi ile) en az 5–10 farklı tekstil fotoğrafı ile test yapılmalıdır. Test edilecek kumaş türleri: pamuklu t-shirt, denim, şifon, kadife ve triko. Her biri için farklı sahne stilleri ve ürün formları denenmelidir. Bu testlerin amacı: (1) prompt şablonlarının gerçek sonuçlarını görmek, (2) doku koruma kalitesini değerlendirmek, (3) gerekirse prompt'ları rafine etmek.
