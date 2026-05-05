// ============================================================
//  LuyenViet — app.js
//  Toàn bộ data + logic + AI feedback (Anthropic API)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
const state = {
  level: null,       // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  mode: null,        // 'topic' | 'free'
  topic: null,       // { name, emoji, prompts, vocab, grammar }
  promptIdx: 0,
  freeTopic: '',
};

// ── DATA ─────────────────────────────────────────────────────
const LEVELS = [
  { id: 'N5', jp: 'N五', name: 'N5', sub: 'Sơ cấp', color: '#10B981' },
  { id: 'N4', jp: 'N四', name: 'N4', sub: 'Tiền trung cấp', color: '#3B82F6' },
  { id: 'N3', jp: 'N三', name: 'N3', sub: 'Trung cấp', color: '#F59E0B' },
  { id: 'N2', jp: 'N二', name: 'N2', sub: 'Tiền cao cấp', color: '#EF4444' },
  { id: 'N1', jp: 'N一', name: 'N1', sub: 'Cao cấp', color: '#8B5CF6' },
];

const TOPICS = {
  N5: [
    {
      name: 'Gia đình', emoji: '👨‍👩‍👧',
      prompts: [
        { jp: '家族について紹介してください。', vn: 'Hãy giới thiệu về gia đình bạn.' },
        { jp: 'お父さん・お母さんはどんな人ですか？', vn: 'Bố mẹ bạn là người như thế nào?' },
        { jp: '家族と何をしますか？', vn: 'Bạn thường làm gì cùng gia đình?' },
      ],
      vocab: [
        { jp: '家族', r: 'かぞく', vn: 'gia đình' },
        { jp: 'お父さん', r: 'おとうさん', vn: 'bố' },
        { jp: 'お母さん', r: 'おかあさん', vn: 'mẹ' },
        { jp: '兄', r: 'あに', vn: 'anh trai' },
        { jp: '姉', r: 'あね', vn: 'chị gái' },
        { jp: '弟', r: 'おとうと', vn: 'em trai' },
        { jp: '妹', r: 'いもうと', vn: 'em gái' },
        { jp: '一緒に', r: 'いっしょに', vn: 'cùng nhau' },
        { jp: '優しい', r: 'やさしい', vn: 'tốt bụng' },
        { jp: '好き', r: 'すき', vn: 'thích' },
      ],
      grammar: [
        { pattern: '〜は〜です', meaning: 'A là B — câu khẳng định cơ bản' },
        { pattern: '〜と〜', meaning: 'Và ~ (liệt kê)' },
        { pattern: '〜が好きです', meaning: 'Thích ~' },
        { pattern: '〜がいます', meaning: 'Có ~ (người/động vật)' },
      ],
    },
    {
      name: 'Thức ăn', emoji: '🍱',
      prompts: [
        { jp: '好きな食べ物は何ですか？', vn: 'Món ăn yêu thích của bạn là gì?' },
        { jp: '毎日何を食べますか？', vn: 'Hằng ngày bạn ăn gì?' },
        { jp: '日本の食べ物を食べたことがありますか？', vn: 'Bạn đã ăn thức ăn Nhật chưa?' },
      ],
      vocab: [
        { jp: '食べ物', r: 'たべもの', vn: 'đồ ăn' },
        { jp: '飲み物', r: 'のみもの', vn: 'đồ uống' },
        { jp: 'ご飯', r: 'ごはん', vn: 'cơm' },
        { jp: 'おいしい', r: 'おいしい', vn: 'ngon' },
        { jp: '甘い', r: 'あまい', vn: 'ngọt' },
        { jp: '辛い', r: 'からい', vn: 'cay' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: '昼ごはん', r: 'ひるごはん', vn: 'bữa trưa' },
        { jp: '晩ごはん', r: 'ばんごはん', vn: 'bữa tối' },
      ],
      grammar: [
        { pattern: '〜を食べます', meaning: 'Ăn ~' },
        { pattern: '〜が一番好きです', meaning: 'Thích ~ nhất' },
        { pattern: '〜たことがあります', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜も〜も', meaning: 'Cả ~ lẫn ~' },
      ],
    },
    {
      name: 'Trường học', emoji: '🏫',
      prompts: [
        { jp: '学校はどうですか？', vn: 'Trường học của bạn như thế nào?' },
        { jp: '好きな科目は何ですか？', vn: 'Môn học yêu thích của bạn là gì?' },
        { jp: '学校で何をしますか？', vn: 'Bạn làm gì ở trường?' },
      ],
      vocab: [
        { jp: '学校', r: 'がっこう', vn: 'trường học' },
        { jp: '先生', r: 'せんせい', vn: 'giáo viên' },
        { jp: '友達', r: 'ともだち', vn: 'bạn bè' },
        { jp: '勉強する', r: 'べんきょうする', vn: 'học' },
        { jp: '科目', r: 'かもく', vn: 'môn học' },
        { jp: '数学', r: 'すうがく', vn: 'toán học' },
        { jp: '英語', r: 'えいご', vn: 'tiếng Anh' },
        { jp: '楽しい', r: 'たのしい', vn: 'vui' },
        { jp: '難しい', r: 'むずかしい', vn: 'khó' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
      ],
      grammar: [
        { pattern: '〜に行きます', meaning: 'Đi đến ~' },
        { pattern: '〜で〜をします', meaning: 'Làm ~ ở ~' },
        { pattern: '〜は〜より〜です', meaning: 'A ~ hơn B' },
        { pattern: 'どんな〜ですか', meaning: 'Là loại ~ gì?' },
      ],
    },
    {
      name: 'Sở thích', emoji: '🎮',
      prompts: [
        { jp: '趣味は何ですか？', vn: 'Sở thích của bạn là gì?' },
        { jp: '週末に何をしますか？', vn: 'Cuối tuần bạn làm gì?' },
        { jp: 'どんな音楽が好きですか？', vn: 'Bạn thích nhạc gì?' },
      ],
      vocab: [
        { jp: '趣味', r: 'しゅみ', vn: 'sở thích' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: 'ゲーム', r: 'ゲーム', vn: 'trò chơi điện tử' },
        { jp: '読む', r: 'よむ', vn: 'đọc' },
        { jp: '聴く', r: 'きく', vn: 'nghe' },
        { jp: '週末', r: 'しゅうまつ', vn: 'cuối tuần' },
        { jp: 'よく', r: 'よく', vn: 'thường xuyên' },
        { jp: '時々', r: 'ときどき', vn: 'thỉnh thoảng' },
        { jp: '楽しむ', r: 'たのしむ', vn: 'tận hưởng' },
      ],
      grammar: [
        { pattern: '〜のが好きです', meaning: 'Thích làm ~' },
        { pattern: 'よく〜ます', meaning: 'Thường xuyên ~' },
        { pattern: '〜たり〜たりします', meaning: 'Làm các thứ như ~ và ~' },
        { pattern: '〜ことがあります', meaning: 'Thỉnh thoảng có ~' },
      ],
    },
    {
      name: 'Thời tiết', emoji: '⛅',
      prompts: [
        { jp: '今日の天気はどうですか？', vn: 'Thời tiết hôm nay như thế nào?' },
        { jp: '好きな季節はいつですか？', vn: 'Bạn thích mùa nào nhất?' },
        { jp: '今、外は寒いですか？', vn: 'Bây giờ bên ngoài có lạnh không?' },
      ],
      vocab: [
        { jp: '天気', r: 'てんき', vn: 'thời tiết' },
        { jp: '晴れ', r: 'はれ', vn: 'nắng' },
        { jp: '雨', r: 'あめ', vn: 'mưa' },
        { jp: '雪', r: 'ゆき', vn: 'tuyết' },
        { jp: '暑い', r: 'あつい', vn: 'nóng' },
        { jp: '寒い', r: 'さむい', vn: 'lạnh' },
        { jp: '春', r: 'はる', vn: 'mùa xuân' },
        { jp: '夏', r: 'なつ', vn: 'mùa hè' },
        { jp: '秋', r: 'あき', vn: 'mùa thu' },
        { jp: '冬', r: 'ふゆ', vn: 'mùa đông' },
      ],
      grammar: [
        { pattern: '〜です / ではありません', meaning: 'Là ~ / Không phải ~' },
        { pattern: '〜ですね', meaning: '~ nhỉ (xác nhận, đồng tình)' },
        { pattern: '〜が一番〜です', meaning: '~ là ~ nhất' },
        { pattern: 'どんな〜ですか', meaning: 'Như thế nào?' },
      ],
    },
    {
      name: 'Tự giới thiệu', emoji: '👋',
      prompts: [
        { jp: '自己紹介をしてください。', vn: 'Hãy tự giới thiệu bản thân.' },
        { jp: 'お名前は何ですか？どこから来ましたか？', vn: 'Tên bạn là gì? Bạn đến từ đâu?' },
        { jp: 'これからよろしくお願いします、と言ってください。', vn: 'Hãy nói lời chào hỏi khi gặp lần đầu.' },
      ],
      vocab: [
        { jp: '名前', r: 'なまえ', vn: 'tên' },
        { jp: '〜歳', r: '〜さい', vn: '~ tuổi' },
        { jp: '国', r: 'くに', vn: 'đất nước' },
        { jp: '学生', r: 'がくせい', vn: 'sinh viên' },
        { jp: '会社員', r: 'かいしゃいん', vn: 'nhân viên công ty' },
        { jp: 'はじめまして', r: 'はじめまして', vn: 'Rất vui được gặp bạn' },
        { jp: 'よろしく', r: 'よろしく', vn: 'mong nhận được sự giúp đỡ' },
        { jp: '住む', r: 'すむ', vn: 'sinh sống' },
      ],
      grammar: [
        { pattern: '私は〜です', meaning: 'Tôi là ~' },
        { pattern: '〜から来ました', meaning: 'Đến từ ~' },
        { pattern: '〜に住んでいます', meaning: 'Đang sống ở ~' },
        { pattern: 'どうぞよろしくお願いします', meaning: 'Mong nhận được sự giúp đỡ (trang trọng)' },
      ],
    },
  ],

  N4: [
    {
      name: 'Du lịch', emoji: '✈️',
      prompts: [
        { jp: '旅行した経験を教えてください。', vn: 'Hãy kể về chuyến du lịch của bạn.' },
        { jp: '行きたい国はどこですか？理由も教えてください。', vn: 'Bạn muốn đến nước nào? Hãy nói lý do.' },
        { jp: '旅行の準備として何をしますか？', vn: 'Bạn chuẩn bị gì trước khi đi du lịch?' },
      ],
      vocab: [
        { jp: '旅行', r: 'りょこう', vn: 'du lịch' },
        { jp: '予約する', r: 'よやくする', vn: 'đặt trước' },
        { jp: '観光地', r: 'かんこうち', vn: 'điểm du lịch' },
        { jp: 'お土産', r: 'おみやげ', vn: 'quà lưu niệm' },
        { jp: '宿泊する', r: 'しゅくはくする', vn: 'lưu trú' },
        { jp: '景色', r: 'けしき', vn: 'phong cảnh' },
        { jp: '経験', r: 'けいけん', vn: 'kinh nghiệm' },
        { jp: '思い出', r: 'おもいで', vn: 'kỷ niệm' },
        { jp: '楽しみにする', r: 'たのしみにする', vn: 'mong chờ' },
        { jp: '感動する', r: 'かんどうする', vn: 'xúc động' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử làm ~ (lần đầu)' },
        { pattern: '〜たいと思っています', meaning: 'Đang nghĩ muốn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích)' },
        { pattern: '〜たことがある', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜ながら', meaning: 'Vừa ~ vừa ~' },
      ],
    },
    {
      name: 'Công việc', emoji: '💼',
      prompts: [
        { jp: 'あなたの仕事や勉強について教えてください。', vn: 'Hãy kể về công việc / việc học của bạn.' },
        { jp: '将来どんな仕事をしたいですか？', vn: 'Tương lai bạn muốn làm công việc gì?' },
        { jp: '仕事の中で何が一番大変ですか？', vn: 'Điều gì khó nhất trong công việc của bạn?' },
      ],
      vocab: [
        { jp: '仕事', r: 'しごと', vn: 'công việc' },
        { jp: '会社', r: 'かいしゃ', vn: 'công ty' },
        { jp: '上司', r: 'じょうし', vn: 'sếp' },
        { jp: '同僚', r: 'どうりょう', vn: 'đồng nghiệp' },
        { jp: '給料', r: 'きゅうりょう', vn: 'lương' },
        { jp: '残業する', r: 'ざんぎょうする', vn: 'làm thêm giờ' },
        { jp: '将来', r: 'しょうらい', vn: 'tương lai' },
        { jp: '夢', r: 'ゆめ', vn: 'ước mơ' },
        { jp: '大変', r: 'たいへん', vn: 'vất vả, khó khăn' },
        { jp: '頑張る', r: 'がんばる', vn: 'cố gắng' },
      ],
      grammar: [
        { pattern: '〜ようになる', meaning: 'Trở nên có thể ~ / bắt đầu ~' },
        { pattern: '〜てしまう', meaning: 'Lỡ ~ / đã xong (nuối tiếc/hoàn thành)' },
        { pattern: '〜ばよかった', meaning: 'Giá mà đã ~ (hối tiếc)' },
        { pattern: '〜はずだ', meaning: 'Đáng lẽ phải ~ / chắc là ~' },
        { pattern: '〜なければならない', meaning: 'Phải ~ (bắt buộc)' },
      ],
    },
    {
      name: 'Sức khỏe', emoji: '🏃',
      prompts: [
        { jp: '健康のために何をしていますか？', vn: 'Bạn làm gì để giữ sức khỏe?' },
        { jp: '運動する習慣がありますか？', vn: 'Bạn có thói quen tập thể dục không?' },
        { jp: '病気になったとき、どうしますか？', vn: 'Khi bị bệnh bạn làm gì?' },
      ],
      vocab: [
        { jp: '健康', r: 'けんこう', vn: 'sức khỏe' },
        { jp: '運動する', r: 'うんどうする', vn: 'tập thể dục' },
        { jp: '病院', r: 'びょういん', vn: 'bệnh viện' },
        { jp: '薬', r: 'くすり', vn: 'thuốc' },
        { jp: '習慣', r: 'しゅうかん', vn: 'thói quen' },
        { jp: '体重', r: 'たいじゅう', vn: 'cân nặng' },
        { jp: '疲れる', r: 'つかれる', vn: 'mệt mỏi' },
        { jp: '休む', r: 'やすむ', vn: 'nghỉ ngơi' },
        { jp: '食生活', r: 'しょくせいかつ', vn: 'chế độ ăn uống' },
        { jp: '睡眠', r: 'すいみん', vn: 'giấc ngủ' },
      ],
      grammar: [
        { pattern: '〜ようにしている', meaning: 'Đang cố gắng để ~' },
        { pattern: '〜たほうがいい', meaning: 'Nên ~ (lời khuyên)' },
        { pattern: '〜すぎる', meaning: 'Quá ~ (mức độ)' },
        { pattern: '〜と、〜', meaning: 'Nếu ~ thì ~ (điều kiện tự nhiên)' },
        { pattern: '〜てから', meaning: 'Sau khi ~ thì ~' },
      ],
    },
    {
      name: 'Phim & Âm nhạc', emoji: '🎬',
      prompts: [
        { jp: '好きな映画や音楽を教えてください。', vn: 'Hãy nói về phim hoặc âm nhạc bạn thích.' },
        { jp: '最近見た映画はどんな映画でしたか？', vn: 'Bộ phim gần đây bạn xem là phim gì?' },
        { jp: 'おすすめの曲やアーティストは？', vn: 'Bài hát / nghệ sĩ bạn muốn giới thiệu là gì?' },
      ],
      vocab: [
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '歌手', r: 'かしゅ', vn: 'ca sĩ' },
        { jp: '感動的', r: 'かんどうてき', vn: 'cảm động' },
        { jp: '笑う', r: 'わらう', vn: 'cười' },
        { jp: '泣く', r: 'なく', vn: 'khóc' },
        { jp: 'ストーリー', r: 'ストーリー', vn: 'cốt truyện' },
        { jp: 'おすすめ', r: 'おすすめ', vn: 'gợi ý, giới thiệu' },
        { jp: '印象に残る', r: 'いんしょうにのこる', vn: 'đọng lại ấn tượng' },
        { jp: 'ジャンル', r: 'ジャンル', vn: 'thể loại' },
      ],
      grammar: [
        { pattern: '〜と思います', meaning: 'Tôi nghĩ rằng ~' },
        { pattern: '〜という〜', meaning: '~ tên là ~' },
        { pattern: '〜てよかった', meaning: 'May mà đã ~ / Vui vì đã ~' },
        { pattern: '〜ので', meaning: 'Vì ~ nên ~ (lý do)' },
        { pattern: '〜し、〜し', meaning: 'Vừa ~ vừa ~ (liệt kê lý do)' },
      ],
    },
    {
      name: 'Mua sắm', emoji: '🛍️',
      prompts: [
        { jp: '最近何かを買いましたか？', vn: 'Gần đây bạn có mua gì không?' },
        { jp: 'どこで買い物をすることが多いですか？', vn: 'Bạn thường mua sắm ở đâu?' },
        { jp: '欲しいものは何ですか？なぜですか？', vn: 'Bạn muốn mua gì? Tại sao?' },
      ],
      vocab: [
        { jp: '買い物', r: 'かいもの', vn: 'mua sắm' },
        { jp: '値段', r: 'ねだん', vn: 'giá cả' },
        { jp: '高い', r: 'たかい', vn: 'đắt' },
        { jp: '安い', r: 'やすい', vn: 'rẻ' },
        { jp: 'セール', r: 'セール', vn: 'giảm giá' },
        { jp: '試着する', r: 'しちゃくする', vn: 'thử đồ' },
        { jp: '財布', r: 'さいふ', vn: 'ví' },
        { jp: 'ブランド', r: 'ブランド', vn: 'thương hiệu' },
        { jp: 'クレジットカード', r: 'クレジットカード', vn: 'thẻ tín dụng' },
        { jp: '返品する', r: 'へんぴんする', vn: 'trả hàng' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử ~ xem sao' },
        { pattern: '〜にする', meaning: 'Quyết định chọn ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜より〜のほうが', meaning: 'So với ~ thì ~ hơn' },
        { pattern: '〜くれる / もらう', meaning: 'Cho ~ / Nhận được ~' },
      ],
    },
    {
      name: 'Thói quen hằng ngày', emoji: '🌅',
      prompts: [
        { jp: '毎朝何時に起きますか？朝の習慣を教えてください。', vn: 'Buổi sáng bạn thức dậy lúc mấy giờ? Thói quen buổi sáng của bạn?' },
        { jp: '一日のスケジュールを説明してください。', vn: 'Hãy mô tả lịch trình một ngày của bạn.' },
        { jp: '夜、寝る前に何をしますか？', vn: 'Buổi tối trước khi ngủ bạn làm gì?' },
      ],
      vocab: [
        { jp: '起きる', r: 'おきる', vn: 'thức dậy' },
        { jp: '寝る', r: 'ねる', vn: 'đi ngủ' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: 'シャワーを浴びる', r: 'シャワーをあびる', vn: 'tắm' },
        { jp: '歯を磨く', r: 'はをみがく', vn: 'đánh răng' },
        { jp: '通勤する', r: 'つうきんする', vn: 'đi làm' },
        { jp: '〜時ごろ', r: '〜じごろ', vn: 'khoảng ~ giờ' },
        { jp: 'いつも', r: 'いつも', vn: 'luôn luôn' },
        { jp: 'たいてい', r: 'たいてい', vn: 'thường thường' },
        { jp: '準備する', r: 'じゅんびする', vn: 'chuẩn bị' },
      ],
      grammar: [
        { pattern: '〜てから〜', meaning: 'Sau khi ~ rồi ~' },
        { pattern: '〜ている', meaning: 'Đang ~ / Thói quen ~' },
        { pattern: '〜前に', meaning: 'Trước khi ~' },
        { pattern: '〜後で', meaning: 'Sau khi ~' },
        { pattern: 'まず〜、次に〜', meaning: 'Đầu tiên ~, tiếp theo ~' },
      ],
    },
  ],

  N3: [
    {
      name: 'Môi trường', emoji: '🌍',
      prompts: [
        { jp: '環境問題についてどう思いますか？', vn: 'Bạn nghĩ gì về vấn đề môi trường?' },
        { jp: '地球温暖化の原因と解決策について書いてください。', vn: 'Viết về nguyên nhân và giải pháp của biến đổi khí hậu.' },
        { jp: '日常生活でできる環境保護の取り組みを紹介してください。', vn: 'Giới thiệu những việc bảo vệ môi trường bạn có thể làm trong cuộc sống hằng ngày.' },
      ],
      vocab: [
        { jp: '環境', r: 'かんきょう', vn: 'môi trường' },
        { jp: '地球温暖化', r: 'ちきゅうおんだんか', vn: 'biến đổi khí hậu' },
        { jp: 'リサイクル', r: 'リサイクル', vn: 'tái chế' },
        { jp: '排気ガス', r: 'はいきガス', vn: 'khí thải' },
        { jp: '再生可能エネルギー', r: 'さいせいかのうエネルギー', vn: 'năng lượng tái tạo' },
        { jp: '自然破壊', r: 'しぜんはかい', vn: 'phá hoại thiên nhiên' },
        { jp: '取り組む', r: 'とりくむ', vn: 'nỗ lực giải quyết' },
        { jp: '削減する', r: 'さくげんする', vn: 'cắt giảm' },
        { jp: '影響', r: 'えいきょう', vn: 'ảnh hưởng' },
        { jp: '将来の世代', r: 'しょうらいのせだい', vn: 'thế hệ tương lai' },
      ],
      grammar: [
        { pattern: '〜によって', meaning: 'Tùy theo ~ / Do ~ gây ra' },
        { pattern: '〜だけでなく〜も', meaning: 'Không chỉ ~ mà còn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích rõ ràng)' },
        { pattern: '〜に対して', meaning: 'Đối với ~ / Về ~' },
        { pattern: '〜べきだ', meaning: 'Nên ~ (trách nhiệm, đúng đắn)' },
      ],
    },
    {
      name: 'Giáo dục', emoji: '📚',
      prompts: [
        { jp: '日本の教育制度について知っていることを書いてください。', vn: 'Viết những gì bạn biết về hệ thống giáo dục Nhật Bản.' },
        { jp: '勉強する動機について説明してください。', vn: 'Hãy nói về động lực học tập của bạn.' },
        { jp: '良い先生の条件は何だと思いますか？', vn: 'Bạn nghĩ điều kiện để trở thành giáo viên tốt là gì?' },
      ],
      vocab: [
        { jp: '教育', r: 'きょういく', vn: 'giáo dục' },
        { jp: '受験', r: 'じゅけん', vn: 'thi cử' },
        { jp: '奨学金', r: 'しょうがくきん', vn: 'học bổng' },
        { jp: '意欲', r: 'いよく', vn: 'ý chí, động lực' },
        { jp: '自主学習', r: 'じしゅがくしゅう', vn: 'tự học' },
        { jp: '目標', r: 'もくひょう', vn: 'mục tiêu' },
        { jp: '能力', r: 'のうりょく', vn: 'năng lực' },
        { jp: '知識', r: 'ちしき', vn: 'kiến thức' },
        { jp: '成績', r: 'せいせき', vn: 'kết quả học tập' },
        { jp: '大学院', r: 'だいがくいん', vn: 'sau đại học' },
      ],
      grammar: [
        { pattern: '〜にとって', meaning: 'Đối với ~ (quan điểm cá nhân)' },
        { pattern: '〜ことによって', meaning: 'Bằng cách ~' },
        { pattern: '〜ようになる', meaning: 'Dần dần trở nên ~ / có thể ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜という点で', meaning: 'Về mặt ~' },
      ],
    },
    {
      name: 'Văn hóa Nhật', emoji: '⛩️',
      prompts: [
        { jp: '日本の文化で興味があるものを紹介してください。', vn: 'Giới thiệu điều gì đó về văn hóa Nhật khiến bạn thấy thú vị.' },
        { jp: '日本のマナーや習慣で、驚いたことはありますか？', vn: 'Bạn có ngạc nhiên về phong tục hay phép lịch sự nào của Nhật không?' },
        { jp: '伝統文化と現代文化の違いについて考えてみてください。', vn: 'Hãy suy nghĩ về sự khác biệt giữa văn hóa truyền thống và hiện đại.' },
      ],
      vocab: [
        { jp: '文化', r: 'ぶんか', vn: 'văn hóa' },
        { jp: '伝統', r: 'でんとう', vn: 'truyền thống' },
        { jp: 'マナー', r: 'マナー', vn: 'phép lịch sự' },
        { jp: '習慣', r: 'しゅうかん', vn: 'phong tục, thói quen' },
        { jp: '礼儀', r: 'れいぎ', vn: 'lễ nghĩa' },
        { jp: '着物', r: 'きもの', vn: 'kimono' },
        { jp: '祭り', r: 'まつり', vn: 'lễ hội' },
        { jp: '独特', r: 'どくとく', vn: 'độc đáo' },
        { jp: '尊重する', r: 'そんちょうする', vn: 'tôn trọng' },
        { jp: '影響を受ける', r: 'えいきょうをうける', vn: 'bị ảnh hưởng' },
      ],
      grammar: [
        { pattern: '〜として', meaning: 'Với tư cách là ~ / Được coi là ~' },
        { pattern: '〜に関して', meaning: 'Liên quan đến ~' },
        { pattern: '〜ながらも', meaning: 'Tuy ~ nhưng vẫn ~' },
        { pattern: '〜わけではない', meaning: 'Không có nghĩa là ~' },
        { pattern: '〜一方で', meaning: 'Trong khi đó ~ / Mặt khác ~' },
      ],
    },
    {
      name: 'Công nghệ & MXH', emoji: '📱',
      prompts: [
        { jp: 'SNSのメリットとデメリットについて書いてください。', vn: 'Viết về ưu và nhược điểm của mạng xã hội.' },
        { jp: '技術の進歩は生活をどう変えましたか？', vn: 'Sự tiến bộ công nghệ đã thay đổi cuộc sống như thế nào?' },
        { jp: 'スマートフォンなしで生活できますか？理由も教えてください。', vn: 'Bạn có thể sống mà không có smartphone không? Hãy nêu lý do.' },
      ],
      vocab: [
        { jp: '技術', r: 'ぎじゅつ', vn: 'công nghệ' },
        { jp: 'SNS', r: 'エスエヌエス', vn: 'mạng xã hội' },
        { jp: '情報', r: 'じょうほう', vn: 'thông tin' },
        { jp: 'コミュニケーション', r: 'コミュニケーション', vn: 'giao tiếp' },
        { jp: '便利', r: 'べんり', vn: 'tiện lợi' },
        { jp: '依存する', r: 'いぞんする', vn: 'phụ thuộc' },
        { jp: 'プライバシー', r: 'プライバシー', vn: 'quyền riêng tư' },
        { jp: '発展する', r: 'はってんする', vn: 'phát triển' },
        { jp: 'デジタル化', r: 'デジタルか', vn: 'số hóa' },
        { jp: '普及する', r: 'ふきゅうする', vn: 'phổ biến' },
      ],
      grammar: [
        { pattern: '〜に伴い', meaning: 'Cùng với ~ / Kéo theo ~' },
        { pattern: '〜反面', meaning: 'Trong khi ~ / Nhưng mặt khác ~' },
        { pattern: '〜ことで', meaning: 'Bằng việc ~ / Nhờ ~' },
        { pattern: '〜かねない', meaning: 'Có thể dẫn đến ~ (tiêu cực)' },
        { pattern: '〜だろうか', meaning: 'Liệu ~ có không? (nghi vấn)' },
      ],
    },
    {
      name: 'Cuộc sống đô thị', emoji: '🏙️',
      prompts: [
        { jp: '都市生活と田舎生活のどちらが好きですか？', vn: 'Bạn thích cuộc sống đô thị hay nông thôn?' },
        { jp: 'あなたの街のいいところと悪いところを書いてください。', vn: 'Viết về điểm tốt và điểm chưa tốt của thành phố bạn đang ở.' },
        { jp: '住みやすい街の条件は何ですか？', vn: 'Điều kiện để một thành phố đáng sống là gì?' },
      ],
      vocab: [
        { jp: '都市', r: 'とし', vn: 'đô thị' },
        { jp: '田舎', r: 'いなか', vn: 'nông thôn' },
        { jp: '交通', r: 'こうつう', vn: 'giao thông' },
        { jp: '渋滞', r: 'じゅうたい', vn: 'kẹt xe' },
        { jp: '治安', r: 'ちあん', vn: 'an ninh' },
        { jp: '騒音', r: 'そうおん', vn: 'tiếng ồn' },
        { jp: '利便性', r: 'りべんせい', vn: 'sự tiện lợi' },
        { jp: '自然', r: 'しぜん', vn: 'thiên nhiên' },
        { jp: '人口', r: 'じんこう', vn: 'dân số' },
        { jp: '格差', r: 'かくさ', vn: 'khoảng cách, bất bình đẳng' },
      ],
      grammar: [
        { pattern: '〜に比べて', meaning: 'So với ~' },
        { pattern: '〜とすれば', meaning: 'Nếu giả sử ~ thì' },
        { pattern: '〜ほど〜ない', meaning: 'Không ~ bằng ~' },
        { pattern: '〜点では', meaning: 'Về mặt ~ / Ở điểm ~' },
        { pattern: '〜からこそ', meaning: 'Chính vì ~ mà ~' },
      ],
    },
  ],

  N2: [
    {
      name: 'Kinh tế xã hội', emoji: '📊',
      prompts: [
        { jp: '少子高齢化問題と社会への影響について論じてください。', vn: 'Thảo luận về vấn đề già hóa dân số và tác động đến xã hội.' },
        { jp: '経済格差はなぜ生まれるのか、あなたの考えを述べてください。', vn: 'Hãy trình bày ý kiến về nguyên nhân của bất bình đẳng kinh tế.' },
        { jp: 'グローバル化のメリットとデメリットを分析してください。', vn: 'Phân tích ưu và nhược điểm của toàn cầu hóa.' },
      ],
      vocab: [
        { jp: '少子高齢化', r: 'しょうしこうれいか', vn: 'già hóa dân số' },
        { jp: '格差', r: 'かくさ', vn: 'bất bình đẳng' },
        { jp: 'グローバル化', r: 'グローバルか', vn: 'toàn cầu hóa' },
        { jp: '財政', r: 'ざいせい', vn: 'tài chính công' },
        { jp: '貧困', r: 'ひんこん', vn: 'nghèo đói' },
        { jp: '福祉', r: 'ふくし', vn: 'phúc lợi xã hội' },
        { jp: '構造的', r: 'こうぞうてき', vn: 'mang tính cấu trúc' },
        { jp: '是正する', r: 'ぜせいする', vn: 'khắc phục, chỉnh sửa' },
        { jp: '持続可能', r: 'じぞくかのう', vn: 'bền vững' },
        { jp: '政策', r: 'せいさく', vn: 'chính sách' },
      ],
      grammar: [
        { pattern: '〜にもかかわらず', meaning: 'Mặc dù ~ nhưng vẫn' },
        { pattern: '〜に伴って', meaning: 'Cùng với ~ / Do ~' },
        { pattern: '〜をめぐって', meaning: 'Xoay quanh vấn đề ~' },
        { pattern: '〜とともに', meaning: 'Cùng với ~ (đồng thời)' },
        { pattern: '〜を踏まえて', meaning: 'Dựa trên / Căn cứ vào ~' },
      ],
    },
    {
      name: 'Khoa học & Tương lai', emoji: '🔬',
      prompts: [
        { jp: 'AIの発展が社会に与える影響について考えてください。', vn: 'Hãy suy nghĩ về tác động của sự phát triển AI đến xã hội.' },
        { jp: '宇宙開発の意義と課題について述べてください。', vn: 'Trình bày ý nghĩa và thách thức của việc khám phá vũ trụ.' },
        { jp: '医療技術の進歩は倫理問題をどのように生むか論じてください。', vn: 'Thảo luận về cách tiến bộ y tế tạo ra các vấn đề đạo đức.' },
      ],
      vocab: [
        { jp: '人工知能', r: 'じんこうちのう', vn: 'trí tuệ nhân tạo' },
        { jp: '倫理', r: 'りんり', vn: 'đạo đức' },
        { jp: '革新', r: 'かくしん', vn: 'cách tân, đổi mới' },
        { jp: 'リスク', r: 'リスク', vn: 'rủi ro' },
        { jp: '自動化', r: 'じどうか', vn: 'tự động hóa' },
        { jp: '予測する', r: 'よそくする', vn: 'dự đoán' },
        { jp: '克服する', r: 'こくふくする', vn: 'khắc phục' },
        { jp: '普及率', r: 'ふきゅうりつ', vn: 'tỷ lệ phổ biến' },
        { jp: '規制', r: 'きせい', vn: 'quy định, kiểm soát' },
        { jp: '共存する', r: 'きょうぞんする', vn: 'cùng tồn tại' },
      ],
      grammar: [
        { pattern: '〜に際して', meaning: 'Khi ~ / Nhân dịp ~' },
        { pattern: '〜に基づいて', meaning: 'Dựa trên ~' },
        { pattern: '〜とは言えない', meaning: 'Không thể nói rằng ~' },
        { pattern: '〜ざるを得ない', meaning: 'Không thể không ~ / Buộc phải ~' },
        { pattern: '〜にすぎない', meaning: 'Chỉ là ~ mà thôi' },
      ],
    },
    {
      name: 'Quan hệ con người', emoji: '🤝',
      prompts: [
        { jp: '現代社会における人間関係の変化について論じてください。', vn: 'Thảo luận về sự thay đổi trong mối quan hệ con người ở xã hội hiện đại.' },
        { jp: '世代間の価値観の違いはなぜ生まれるのか述べてください。', vn: 'Hãy nói về lý do có sự khác biệt về giá trị giữa các thế hệ.' },
        { jp: 'コミュニケーション能力を高めるにはどうすればよいか。', vn: 'Làm thế nào để nâng cao kỹ năng giao tiếp?' },
      ],
      vocab: [
        { jp: '価値観', r: 'かちかん', vn: 'hệ giá trị' },
        { jp: '世代', r: 'せだい', vn: 'thế hệ' },
        { jp: '摩擦', r: 'まさつ', vn: 'xung đột, bất hòa' },
        { jp: '共感', r: 'きょうかん', vn: 'đồng cảm' },
        { jp: '対立', r: 'たいりつ', vn: 'đối lập, mâu thuẫn' },
        { jp: '相互理解', r: 'そうごりかい', vn: 'hiểu biết lẫn nhau' },
        { jp: '孤立', r: 'こりつ', vn: 'cô lập' },
        { jp: '信頼', r: 'しんらい', vn: 'niềm tin' },
        { jp: '多様性', r: 'たようせい', vn: 'sự đa dạng' },
        { jp: '協調性', r: 'きょうちょうせい', vn: 'tinh thần hợp tác' },
      ],
      grammar: [
        { pattern: '〜であるがゆえに', meaning: 'Chính vì là ~ mà' },
        { pattern: '〜に関わらず', meaning: 'Bất kể ~ / Không phân biệt ~' },
        { pattern: '〜においては', meaning: 'Trong bối cảnh ~ / Về ~' },
        { pattern: '〜とは限らない', meaning: 'Không nhất thiết là ~' },
        { pattern: '〜をよそに', meaning: 'Bất chấp ~ / Không đếm xỉa đến ~' },
      ],
    },
  ],

  N1: [
    {
      name: 'Triết học & Tư duy', emoji: '🧠',
      prompts: [
        { jp: '「幸福とは何か」について、哲学的視点から論じてください。', vn: 'Hãy thảo luận về "hạnh phúc là gì" từ góc độ triết học.' },
        { jp: '道徳と法律の相違点と関係性を分析してください。', vn: 'Phân tích điểm khác biệt và mối quan hệ giữa đạo đức và pháp luật.' },
        { jp: '「自由」と「責任」はどのような関係にあるか論じてください。', vn: 'Thảo luận về mối quan hệ giữa "tự do" và "trách nhiệm".' },
      ],
      vocab: [
        { jp: '概念', r: 'がいねん', vn: 'khái niệm' },
        { jp: '本質', r: 'ほんしつ', vn: 'bản chất' },
        { jp: '矛盾', r: 'むじゅん', vn: 'mâu thuẫn' },
        { jp: '見解', r: 'けんかい', vn: 'quan điểm' },
        { jp: '普遍性', r: 'ふへんせい', vn: 'tính phổ quát' },
        { jp: '相対的', r: 'そうたいてき', vn: 'tương đối' },
        { jp: '批判的', r: 'ひはんてき', vn: 'phê phán' },
        { jp: '論証', r: 'ろんしょう', vn: 'luận chứng' },
        { jp: '前提', r: 'ぜんてい', vn: 'tiền đề' },
        { jp: '帰結する', r: 'きけつする', vn: 'dẫn đến kết luận' },
      ],
      grammar: [
        { pattern: '〜ならではの', meaning: 'Chỉ ~ mới có / Đặc trưng của ~' },
        { pattern: '〜に至っては', meaning: 'Thậm chí đến mức ~ (cực đoan)' },
        { pattern: '〜ずにはおかない', meaning: 'Nhất định sẽ ~ / không thể không ~' },
        { pattern: '〜とも〜とも言えない', meaning: 'Không thể nói là ~ cũng chẳng phải ~' },
        { pattern: '〜がゆえに', meaning: 'Vì là ~ / Do ~' },
      ],
    },
    {
      name: 'Chính trị & Xã hội', emoji: '🏛️',
      prompts: [
        { jp: '民主主義の課題と可能性について論じてください。', vn: 'Thảo luận về thách thức và tiềm năng của nền dân chủ.' },
        { jp: '国際社会における日本の役割について考えてください。', vn: 'Suy nghĩ về vai trò của Nhật Bản trong cộng đồng quốc tế.' },
        { jp: '言論の自由と規制のバランスについてあなたの考えを述べてください。', vn: 'Trình bày ý kiến về sự cân bằng giữa tự do ngôn luận và kiểm duyệt.' },
      ],
      vocab: [
        { jp: '民主主義', r: 'みんしゅしゅぎ', vn: 'dân chủ' },
        { jp: '主権', r: 'しゅけん', vn: 'chủ quyền' },
        { jp: '言論の自由', r: 'げんろんのじゆう', vn: 'tự do ngôn luận' },
        { jp: '権利', r: 'けんり', vn: 'quyền lợi' },
        { jp: '義務', r: 'ぎむ', vn: 'nghĩa vụ' },
        { jp: '国際秩序', r: 'こくさいちつじょ', vn: 'trật tự quốc tế' },
        { jp: '透明性', r: 'とうめいせい', vn: 'tính minh bạch' },
        { jp: '批准する', r: 'ひじゅんする', vn: 'phê chuẩn' },
        { jp: '覇権', r: 'はけん', vn: 'bá quyền' },
        { jp: '合意形成', r: 'ごういけいせい', vn: 'hình thành đồng thuận' },
      ],
      grammar: [
        { pattern: '〜に照らして', meaning: 'Căn cứ vào ~ / Soi chiếu với ~' },
        { pattern: '〜を契機として', meaning: 'Lấy ~ làm cơ hội / Bắt đầu từ ~' },
        { pattern: '〜いかんによらず', meaning: 'Bất kể ~ như thế nào' },
        { pattern: '〜のもとで', meaning: 'Dưới ~ / Trong điều kiện ~' },
        { pattern: '〜にほかならない', meaning: 'Chính là ~ / Không gì khác là ~' },
      ],
    },
    {
      name: 'Văn học & Nghệ thuật', emoji: '🎨',
      prompts: [
        { jp: '芸術は社会にどのような役割を果たすか論じてください。', vn: 'Thảo luận về vai trò của nghệ thuật trong xã hội.' },
        { jp: '日本文学の特徴と世界文学への影響を述べてください。', vn: 'Trình bày đặc điểm của văn học Nhật và ảnh hưởng đến văn học thế giới.' },
        { jp: '現代アートの意義について批判的に考察してください。', vn: 'Suy ngẫm phê phán về ý nghĩa của nghệ thuật đương đại.' },
      ],
      vocab: [
        { jp: '芸術', r: 'げいじゅつ', vn: 'nghệ thuật' },
        { jp: '表現', r: 'ひょうげん', vn: 'biểu đạt, biểu hiện' },
        { jp: '審美眼', r: 'しんびがん', vn: 'thẩm mỹ' },
        { jp: '象徴', r: 'しょうちょう', vn: 'biểu tượng' },
        { jp: '解釈', r: 'かいしゃく', vn: 'diễn giải' },
        { jp: '普遍的', r: 'ふへんてき', vn: 'mang tính phổ quát' },
        { jp: '独創性', r: 'どくそうせい', vn: 'sự sáng tạo, độc đáo' },
        { jp: '批評', r: 'ひひょう', vn: 'phê bình' },
        { jp: '前衛的', r: 'ぜんえいてき', vn: 'tiền phong' },
        { jp: '文脈', r: 'ぶんみゃく', vn: 'ngữ cảnh, bối cảnh' },
      ],
      grammar: [
        { pattern: '〜すら〜ない', meaning: 'Thậm chí ~ cũng không' },
        { pattern: '〜というものだ', meaning: 'Đó chính là ~, bản chất của ~' },
        { pattern: '〜とあれば', meaning: 'Nếu là (trong trường hợp đặc biệt) ~' },
        { pattern: '〜んがために', meaning: 'Để đạt được ~ / Vì muốn ~' },
        { pattern: '〜に相違ない', meaning: 'Chắc chắn là ~ / Không nghi ngờ gì' },
      ],
    },
  ],
};

// ── PROMPTS GỢI Ý CHO VIẾT TỰ DO (AI sẽ generate thêm) ──────
const FREE_PROMPT_TEMPLATE = (topic, level) => `Bạn là giáo viên tiếng Nhật JLPT ${level}.

Người học muốn luyện viết về chủ đề: "${topic}"
Cấp độ: ${level}

Hãy tạo gợi ý theo format JSON sau (chỉ JSON, không giải thích thêm):
{
  "prompt_jp": "Câu đề bài bằng tiếng Nhật",
  "prompt_vn": "Câu đề bài bằng tiếng Việt",
  "vocab": [
    {"jp": "từ tiếng Nhật", "r": "furigana", "vn": "nghĩa tiếng Việt"},
    ... (8-10 từ phù hợp cấp độ)
  ],
  "grammar": [
    {"pattern": "〜パターン", "meaning": "ý nghĩa tiếng Việt"},
    ... (4-5 mẫu ngữ pháp phù hợp cấp độ)
  ]
}`;

const FEEDBACK_PROMPT = (level, prompt, answer) => `Bạn là giáo viên tiếng Nhật chấm bài JLPT ${level}.

Đề bài: ${prompt}
Bài viết của học sinh: 「${answer}」

Chấm điểm và cho feedback theo format JSON sau (chỉ JSON):
{
  "score": 85,
  "corrected": "câu đã sửa hoặc câu mẫu",
  "good_points": "điểm tốt trong bài (bằng tiếng Việt)",
  "issues": "lỗi cần sửa, nếu không có để trống (bằng tiếng Việt)",
  "explanation": "giải thích chi tiết ngắn gọn bằng tiếng Việt",
  "natural": "cách diễn đạt tự nhiên hơn nếu cần, bằng tiếng Nhật"
}`;

// ── API CALL ─────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content.map(i => i.text || '').join('');
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

// ── RENDER HELPERS ────────────────────────────────────────────
function renderLevels() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = LEVELS.map(l => `
    <div class="level-card" id="lv-${l.id}" onclick="selectLevel('${l.id}')">
      <div class="level-jp" style="color:${l.color}">${l.jp}</div>
      <div class="level-name">${l.name}</div>
      <div class="level-sub">${l.sub}</div>
    </div>
  `).join('');
}

function renderTopics() {
  const topics = TOPICS[state.level] || [];
  document.getElementById('topic-level-badge').textContent = state.level;
  const grid = document.getElementById('topic-grid');
  grid.innerHTML = topics.map((t, i) => `
    <div class="topic-card" onclick="selectTopic(${i})">
      <div class="topic-emoji">${t.emoji}</div>
      <div class="topic-name">${t.name}</div>
      <div class="topic-count">${t.prompts.length} câu hỏi</div>
    </div>
  `).join('');
}

function renderSidebar() {
  const t = state.topic;
  document.getElementById('sidebar-topic').textContent = `${t.emoji} ${t.name}`;
  document.getElementById('sidebar-level').textContent = state.level;

  const vocabList = document.getElementById('vocab-list');
  vocabList.innerHTML = t.vocab.map(v => `
    <div class="vocab-item" title="Click để copy" onclick="copyText('${v.jp}')">
      <div>
        <div class="vocab-jp">${v.jp}</div>
        <div class="vocab-reading">${v.r}</div>
      </div>
      <div class="vocab-vn">${v.vn}</div>
    </div>
  `).join('');
  document.getElementById('vocab-count').textContent = t.vocab.length;

  const grammarList = document.getElementById('grammar-list');
  grammarList.innerHTML = t.grammar.map(g => `
    <div class="grammar-item" onclick="copyText('${g.pattern}')">
      <div class="grammar-pattern">${g.pattern}</div>
      <div class="grammar-meaning">${g.meaning}</div>
    </div>
  `).join('');
  document.getElementById('grammar-count').textContent = t.grammar.length;
}

function renderPrompt() {
  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  document.getElementById('writing-prompt').innerHTML = `
    <div class="prompt-label">✏ Đề bài ${state.promptIdx + 1}</div>
    <div class="prompt-text">${p.jp}</div>
    <div class="prompt-vn">${p.vn}</div>
  `;
}

// ── ACTIONS ───────────────────────────────────────────────────
function selectLevel(id) {
  state.level = id;
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
  document.getElementById('lv-' + id).classList.add('active');
  showStep('step-mode');
  scrollToStep('step-mode');
}

function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');

  if (mode === 'topic') {
    renderTopics();
    showStep('step-topics');
    scrollToStep('step-topics');
  } else {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  }
}

function selectTopic(idx) {
  const topics = TOPICS[state.level];
  state.topic = topics[idx];
  state.promptIdx = 0;
  renderSidebar();
  renderPrompt();
  showStep('step-writing');
  scrollToStep('step-writing');
  clearFeedback();
}

function setFreeTopic(val) {
  document.getElementById('free-topic-input').value = val;
}

async function getSuggestions() {
  const input = document.getElementById('free-topic-input').value.trim();
  if (!input) {
    document.getElementById('free-topic-input').focus();
    return;
  }
  state.freeTopic = input;

  document.getElementById('free-loading').style.display = 'flex';

  try {
    const raw = await callClaude(FREE_PROMPT_TEMPLATE(input, state.level));
    const data = parseJSON(raw);

    if (!data) throw new Error('Parse failed');

    state.topic = {
      name: input,
      emoji: '✏️',
      prompts: [{ jp: data.prompt_jp, vn: data.prompt_vn }],
      vocab: data.vocab || [],
      grammar: data.grammar || [],
    };
    state.promptIdx = 0;

    renderSidebar();
    renderPrompt();
    showStep('step-writing');
    scrollToStep('step-writing');
    clearFeedback();
  } catch (e) {
    alert('Có lỗi kết nối. Vui lòng thử lại!');
  } finally {
    document.getElementById('free-loading').style.display = 'none';
  }
}

async function submitWriting() {
  const answer = document.getElementById('user-writing').value.trim();
  if (!answer) {
    document.getElementById('user-writing').focus();
    return;
  }

  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Đang chấm bài...';
  btn.disabled = true;

  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  const fbArea = document.getElementById('feedback-area');
  fbArea.innerHTML = `
    <div class="feedback-box" style="padding:1.5rem;">
      <div class="loading-bar" style="padding:0;">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <span>AI đang phân tích bài viết của bạn...</span>
      </div>
    </div>`;

  try {
    const raw = await callClaude(FEEDBACK_PROMPT(state.level, p.jp, answer));
    const fb = parseJSON(raw);
    if (!fb) throw new Error();

    const scoreClass =
      fb.score >= 85 ? 'score-great' :
      fb.score >= 70 ? 'score-good' :
      fb.score >= 50 ? 'score-ok' : 'score-low';

    const scoreLabel =
      fb.score >= 85 ? 'Xuất sắc!' :
      fb.score >= 70 ? 'Tốt lắm!' :
      fb.score >= 50 ? 'Cần cải thiện' : 'Hãy cố gắng thêm!';

    fbArea.innerHTML = `
      <div class="feedback-box">
        <div class="feedback-top">
          <div class="score-circle ${scoreClass}">${fb.score ?? '✓'}</div>
          <div>
            <div class="score-label">${scoreLabel}</div>
            <div class="score-sublabel">Phân tích chi tiết bên dưới</div>
          </div>
        </div>
        <div class="feedback-body">
          ${fb.good_points ? `
            <div class="fb-section">
              <div class="fb-section-title">✅ Điểm tốt</div>
              <div class="fb-good">${fb.good_points}</div>
            </div>` : ''}
          ${fb.issues ? `
            <div class="fb-section">
              <div class="fb-section-title">⚠ Cần chú ý</div>
              <div class="fb-issue">${fb.issues}</div>
            </div>` : ''}
          ${fb.corrected ? `
            <div class="fb-section">
              <div class="fb-section-title">📝 Câu sửa / câu mẫu</div>
              <div class="fb-corrected">${fb.corrected}</div>
            </div>` : ''}
          ${fb.natural ? `
            <div class="fb-section">
              <div class="fb-section-title">💬 Diễn đạt tự nhiên hơn</div>
              <div class="fb-corrected">${fb.natural}</div>
            </div>` : ''}
          ${fb.explanation ? `
            <div class="fb-section">
              <div class="fb-section-title">📖 Giải thích</div>
              <div class="fb-section-body">${fb.explanation}</div>
            </div>` : ''}
        </div>
      </div>`;

    document.getElementById('next-actions').style.display = 'flex';
    fbArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch {
    fbArea.innerHTML = `<div class="feedback-box" style="padding:1.25rem; color:#DC2626;">Không thể kết nối. Vui lòng thử lại.</div>`;
  } finally {
    btn.textContent = 'Nộp bài & nhận feedback ↗';
    btn.disabled = false;
  }
}

function nextPrompt() {
  state.promptIdx++;
  renderPrompt();
  clearFeedback();
  document.getElementById('writing-prompt').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function tryAgain() {
  document.getElementById('user-writing').value = '';
  clearFeedback();
  document.getElementById('user-writing').focus();
}

function clearFeedback() {
  document.getElementById('feedback-area').innerHTML = '';
  document.getElementById('next-actions').style.display = 'none';
}

function clearWriting() {
  document.getElementById('user-writing').value = '';
  document.getElementById('char-count').textContent = '0 ký tự';
}

function backToTopics() {
  if (state.mode === 'free') {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  } else {
    showStep('step-topics');
    scrollToStep('step-topics');
  }
  document.getElementById('step-writing').classList.add('step-hidden');
  document.getElementById('next-actions').style.display = 'none';
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ── STEP DISPLAY ─────────────────────────────────────────────
function showStep(id) {
  const steps = ['step-mode','step-topics','step-free-input','step-writing'];
  steps.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('step-hidden');
  });
  const target = document.getElementById(id);
  if (target) target.classList.remove('step-hidden');
}

function scrollToStep(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ── CHAR COUNTER ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('user-writing');
  const cc = document.getElementById('char-count');
  if (ta) {
    ta.addEventListener('input', () => {
      cc.textContent = ta.value.length + ' ký tự';
    });
  }

  // Enter key for free input
  const fi = document.getElementById('free-topic-input');
  if (fi) {
    fi.addEventListener('keydown', e => {
      if (e.key === 'Enter') getSuggestions();
    });
  }

  renderLevels();
});

// ============================================================
// PATCH 2026-05-B — Library header, richer topic data, modal details, search/filter, drill by topic
// ============================================================
const LV_TOPIC_JP_MAP = {
  'Tự giới thiệu':'自己紹介','Gia đình':'家族','Bạn bè':'友達','Trường học':'学校','Lớp học':'教室','Giáo viên':'先生','Môn học yêu thích':'好きな科目','Một ngày của tôi':'私の一日','Buổi sáng':'朝','Buổi tối':'夜','Cuối tuần':'週末','Sở thích':'趣味','Âm nhạc':'音楽','Phim ảnh':'映画','Anime':'アニメ','Manga':'漫画','Thể thao':'スポーツ','Bóng đá':'サッカー','Mua sắm':'買い物','Quần áo':'服','Thức ăn':'食べ物','Đồ uống':'飲み物','Bữa sáng':'朝ごはん','Bữa trưa':'昼ごはん','Bữa tối':'晩ごはん','Nhà hàng':'レストラン','Quán cà phê':'カフェ','Nấu ăn đơn giản':'簡単な料理','Trái cây':'果物','Rau củ':'野菜','Thời tiết':'天気','Mùa xuân':'春','Mùa hè':'夏','Mùa thu':'秋','Mùa đông':'冬','Sinh nhật':'誕生日','Ngày nghỉ':'休みの日','Kỳ nghỉ hè':'夏休み','Du lịch gần nhà':'近くへの旅行','Ga tàu':'駅','Xe buýt':'バス','Đi bộ':'散歩','Xe đạp':'自転車','Nhà của tôi':'私の家','Phòng của tôi':'私の部屋','Thành phố của tôi':'私の町','Công viên':'公園','Siêu thị':'スーパー','Hiệu sách':'本屋','Bệnh viện':'病院','Ngân hàng':'銀行','Bưu điện':'郵便局','Khách sạn':'ホテル','Động vật':'動物','Thú cưng':'ペット','Mèo':'猫','Chó':'犬','Hoa':'花','Màu sắc':'色','Số đếm':'数','Thời gian':'時間','Lịch trình':'予定','Đi học':'通学','Đi làm':'通勤','Đi chơi':'遊びに行くこと','Gặp bạn':'友達に会うこと','Gọi điện':'電話','Nhắn tin':'メッセージ','Ảnh chụp':'写真','Quà tặng':'プレゼント','Tiền bạc':'お金','Sức khỏe':'健康','Đau ốm':'病気','Tập thể dục nhẹ':'軽い運動','Ngủ':'睡眠','Dậy sớm':'早起き','Dọn phòng':'部屋の掃除','Giặt đồ':'洗濯','Tắm rửa':'シャワー','Đánh răng':'歯磨き','Đọc sách':'読書','Viết nhật ký':'日記を書くこと','Học tiếng Nhật':'日本語の勉強','Kanji yêu thích':'好きな漢字','Hiragana và Katakana':'ひらがなとカタカナ','Cửa hàng tiện lợi':'コンビニ','Món Nhật yêu thích':'好きな日本料理','Việt Nam':'ベトナム','Nhật Bản':'日本','Ngôn ngữ':'言語','Ước mơ nhỏ':'小さな夢','Người tôi thích':'好きな人','Việc tôi ghét':'嫌いなこと','Kỷ niệm vui':'楽しい思い出','Ngày mưa':'雨の日','Ngày nắng':'晴れの日','Đi biển':'海へ行くこと','Đi núi':'山へ行くこと','Lễ hội':'祭り','Tết':'旧正月',
  'Du lịch':'旅行','Công việc':'仕事','Phim và âm nhạc':'映画と音楽','Thói quen hằng ngày':'毎日の習慣','Kế hoạch cuối tuần':'週末の予定','Kỳ nghỉ đáng nhớ':'思い出に残る休暇','Kinh nghiệm học tiếng Nhật':'日本語学習の経験','Mục tiêu năm nay':'今年の目標','Việc làm thêm':'アルバイト','Công ty mơ ước':'理想の会社','Đồng nghiệp':'同僚','Sếp tốt':'良い上司','Phỏng vấn xin việc':'就職面接','Email đơn giản':'簡単なメール','Cuộc hẹn':'約束','Xin lỗi và cảm ơn':'謝罪と感謝','Giúp đỡ người khác':'人を助けること','Sống một mình':'一人暮らし','Thuê nhà':'部屋を借りること','Chuyển nhà':'引っ越し','Nội trợ':'家事','Tiết kiệm tiền':'節約','Mua hàng online':'オンラインショッピング','So sánh sản phẩm':'商品の比較','Quà lưu niệm':'お土産','Nhà hàng yêu thích':'好きなレストラン','Công thức món ăn':'料理のレシピ','Ăn uống lành mạnh':'健康的な食生活','Tập thể dục':'運動','Bị cảm':'風邪をひくこと','Đi khám bệnh':'病院へ行くこと','Giấc ngủ':'睡眠','Stress nhẹ':'軽いストレス','Đi tàu điện':'電車に乗ること','Lạc đường':'道に迷うこと','Hỏi đường':'道を尋ねること','Đặt phòng khách sạn':'ホテルを予約すること','Sân bay':'空港','Kế hoạch du lịch Nhật':'日本旅行の計画','Lễ hội Nhật':'日本の祭り','Văn hóa tặng quà':'贈り物の文化','Phong tục chào hỏi':'あいさつの習慣','Gia đình hiện đại':'現代の家族','Bạn thân':'親友','Hàng xóm':'近所の人','Nuôi thú cưng':'ペットを飼うこと','Mạng xã hội':'SNS','Điện thoại thông minh':'スマートフォン','Ứng dụng hữu ích':'便利なアプリ','Học online':'オンライン学習','Xem video':'動画を見ること','Đọc tin tức':'ニュースを読むこと','Sở thích mới':'新しい趣味','Học nhạc cụ':'楽器を習うこと','Chơi thể thao':'スポーツをすること','Leo núi':'登山','Cắm trại':'キャンプ','Chụp ảnh':'写真撮影','Sách yêu thích':'好きな本','Phim gần đây':'最近見た映画','Bài hát yêu thích':'好きな歌','Anime đề xuất':'おすすめのアニメ','Manga đề xuất':'おすすめの漫画','Thành phố đáng sống':'住みやすい町','Nông thôn':'田舎','Giao thông công cộng':'公共交通機関','Ô nhiễm nhẹ':'軽い汚染','Tái chế':'リサイクル','Tiết kiệm điện':'節電','Thời tiết xấu':'悪い天気','Mùa yêu thích':'好きな季節','Sự kiện ở trường':'学校行事','Kỳ thi':'試験','Học bổng':'奨学金','Câu lạc bộ':'クラブ活動','Giáo viên tốt':'良い先生','Môn khó':'難しい科目','Tương lai':'将来','Ước mơ nghề nghiệp':'将来の夢','Người truyền cảm hứng':'影響を受けた人','Kỷ niệm thời thơ ấu':'子どものころの思い出','Lỗi từng mắc':'過去の失敗','Điều muốn thử':'挑戦したいこと','Thói quen muốn bỏ':'やめたい習慣','Thói quen tốt':'良い習慣','Ngày bận rộn':'忙しい日','Ngày thư giãn':'リラックスする日','Tin nhắn cho bạn':'友達へのメッセージ','Mời bạn đi chơi':'友達を誘うこと','Từ chối lịch hẹn':'約束を断ること','Nhờ vả':'お願いすること','Cảm nhận về Nhật Bản':'日本への印象','So sánh Việt Nam và Nhật':'ベトナムと日本の比較','Mục tiêu JLPT':'JLPTの目標','Kế hoạch học tập':'学習計画',
  'Môi trường':'環境','Giáo dục':'教育','Văn hóa Nhật':'日本文化','Công nghệ và mạng xã hội':'技術とSNS','Cuộc sống đô thị':'都市生活','Làm việc nhóm':'チームワーク','Kỹ năng giao tiếp':'コミュニケーション能力','Quản lý thời gian':'時間管理','Áp lực học tập':'学習のプレッシャー','Áp lực công việc':'仕事のストレス','Cân bằng cuộc sống':'生活のバランス','Lựa chọn nghề nghiệp':'職業選択','Chuyển việc':'転職','Làm việc từ xa':'リモートワーク','Học ngoại ngữ':'外国語学習','Tự học':'自主学習','Du học Nhật Bản':'日本留学','Thi cử':'試験制度','Giáo viên lý tưởng':'理想の教師','Trường học tương lai':'未来の学校','Tin giả':'フェイクニュース','Bảo mật thông tin':'情報セキュリティ','Phụ thuộc điện thoại':'スマホ依存','Thanh toán điện tử':'電子決済','Văn hóa công ty':'企業文化','Quan hệ cấp trên cấp dưới':'上下関係','Gia đình và sự nghiệp':'家族とキャリア','Kết hôn muộn':'晩婚化','Nuôi con':'子育て','Sức khỏe tinh thần':'メンタルヘルス','Du lịch bền vững':'持続可能な旅行','Du lịch một mình':'一人旅','Phép lịch sự nơi công cộng':'公共マナー','Tàu điện Nhật Bản':'日本の電車','Đúng giờ':'時間厳守','Tình nguyện':'ボランティア','Hoạt động cộng đồng':'地域活動','Bảo vệ động vật':'動物保護','Biến đổi khí hậu':'気候変動','Không gian xanh':'緑地','Kẹt xe':'渋滞','Sống ở nông thôn':'田舎暮らし','Di cư lên thành phố':'都市への移住','Ẩm thực truyền thống':'伝統料理','Thức ăn nhanh':'ファストフード','Anime và văn hóa đại chúng':'アニメと大衆文化','Thể thao và xã hội':'スポーツと社会','Thành công là gì':'成功とは何か','Thất bại và bài học':'失敗と学び','Sự tự tin':'自信','Động lực cá nhân':'個人の動機','Kỷ luật bản thân':'自己管理','Tiêu dùng thông minh':'賢い消費','Khoảng cách thế hệ':'世代間ギャップ','Vai trò của phụ nữ':'女性の役割','Bình đẳng giới':'ジェンダー平等','Người cao tuổi':'高齢者','Xã hội già hóa':'高齢化社会','AI trong đời sống':'生活の中のAI','Tương lai công việc':'仕事の未来','Sốc văn hóa':'カルチャーショック','Ngôn ngữ và tư duy':'言語と思考','Dịch thuật':'翻訳','Thuyết trình':'プレゼンテーション','Tranh luận':'議論','Ý kiến cá nhân':'個人の意見','Cuộc sống tối giản':'ミニマルな生活','Hạnh phúc hằng ngày':'日常の幸せ',
  'Kinh tế xã hội':'社会経済','Khoa học và tương lai':'科学と未来','Quan hệ con người':'人間関係','Toàn cầu hóa':'グローバル化','Già hóa dân số':'少子高齢化','Thiếu lao động':'労働力不足','Bất bình đẳng kinh tế':'経済格差','Phúc lợi xã hội':'社会福祉','Chính sách giáo dục':'教育政策','Cải cách thi cử':'試験改革','Đại học và việc làm':'大学と就職','Làm việc từ xa':'リモートワーク','Văn hóa làm thêm giờ':'残業文化','Cân bằng công việc cuộc sống':'ワークライフバランス','Lãnh đạo':'リーダーシップ','Đạo đức nghề nghiệp':'職業倫理','Khởi nghiệp':'起業','Đổi mới sáng tạo':'イノベーション','AI và việc làm':'AIと雇用','Tự động hóa':'自動化','Dữ liệu cá nhân':'個人データ','Quyền riêng tư':'プライバシー','An ninh mạng':'サイバーセキュリティ','Tự do ngôn luận online':'オンライン上の言論の自由','Nền tảng mạng xã hội':'SNSプラットフォーム','Nghiện kỹ thuật số':'デジタル依存','Y tế từ xa':'遠隔医療','Đạo đức trong y học':'医療倫理','Năng lượng tái tạo':'再生可能エネルギー','Chính sách môi trường':'環境政策','Kinh tế tuần hoàn':'循環型経済','Tiêu dùng bền vững':'持続可能な消費','Trách nhiệm doanh nghiệp':'企業責任','Du lịch quá tải':'オーバーツーリズム','Bảo tồn văn hóa':'文化保護','Sức mạnh mềm':'ソフトパワー','Giao lưu quốc tế':'国際交流','Di cư lao động':'労働移民','Đa văn hóa':'多文化共生','Quy hoạch đô thị':'都市計画','Cô lập xã hội':'社会的孤立','Stress xã hội':'社会的ストレス','Tỷ lệ sinh thấp':'低出生率','Bình đẳng cơ hội':'機会の平等','Chăm sóc dài hạn':'介護','Đạo đức công dân':'市民倫理','Chính sách thuế':'税制','Lương tối thiểu':'最低賃金','Kinh tế chia sẻ':'シェアリングエコノミー','Tiền điện tử':'暗号資産','Không tiền mặt':'キャッシュレス','Chuỗi cung ứng':'サプライチェーン','Khủng hoảng lương thực':'食料危機','An toàn thực phẩm':'食品安全','Thiên tai':'自然災害','Quản lý khủng hoảng':'危機管理','Thành phố thông minh':'スマートシティ','Robot trong dịch vụ':'サービスロボット','Học tập suốt đời':'生涯学習','Năng lực phản biện':'批判的思考力','Viết học thuật':'アカデミックライティング','Tương lai Nhật Bản':'日本の未来','Tương lai Việt Nam':'ベトナムの未来',
  'Triết học và tư duy':'哲学と思考','Chính trị và xã hội':'政治と社会','Văn học và nghệ thuật':'文学と芸術','Bản chất của hạnh phúc':'幸福の本質','Tự do và trách nhiệm':'自由と責任','Đạo đức và pháp luật':'道徳と法律','Công lý xã hội':'社会正義','Quyền lực và minh bạch':'権力と透明性','Dân chủ hiện đại':'現代民主主義','Chủ nghĩa cá nhân':'個人主義','Chủ nghĩa cộng đồng':'共同体主義','Bản sắc dân tộc':'民族的アイデンティティ','Ký ức lịch sử':'歴史的記憶','Di sản văn hóa':'文化遺産','Ngôn ngữ và quyền lực':'言語と権力','Tri thức và định kiến':'知識と偏見','Sự thật trong truyền thông':'メディアにおける真実','AI và nhân tính':'AIと人間性','Đạo đức AI':'AI倫理','Công nghệ giám sát':'監視技術','Sinh mệnh và đạo đức':'生命と倫理','Tuổi thọ và ý nghĩa sống':'長寿と生の意味','Công bằng khí hậu':'気候正義','Nghệ thuật trong khủng hoảng':'危機における芸術','Tự do biểu đạt':'表現の自由','Kiểm duyệt và trách nhiệm':'検閲と責任','Giáo dục khai phóng':'リベラルアーツ教育','Di cư và bản sắc':'移民とアイデンティティ','Quốc gia và biên giới':'国家と国境','Trật tự quốc tế':'国際秩序','Xung đột và hòa bình':'紛争と平和','Bất bình đẳng cấu trúc':'構造的不平等','Cô đơn hiện đại':'現代の孤独','Gia đình hậu hiện đại':'ポストモダンの家族','Tôn giáo trong hiện đại':'現代における宗教','Rủi ro xã hội':'リスク社会','Dữ liệu và đạo đức':'データと倫理','Thuật toán và thiên kiến':'アルゴリズムと偏見','Cái đẹp là gì':'美とは何か','Cái thiện là gì':'善とは何か','Ý chí tự do':'自由意志','Tha thứ và công lý':'許しと正義','Tương lai của giáo dục':'教育の未来','Tương lai của lao động':'労働の未来','Tương lai của nghệ thuật':'芸術の未来','Phê phán công nghệ':'技術批判','Đời sống số':'デジタル生活','Niềm tin xã hội':'社会的信頼','Hệ giá trị':'価値体系','Tính phổ quát và tương đối':'普遍性と相対性','Ý nghĩa của việc viết':'書くことの意味'
};

function lvJPTopic(name){
  if (LV_TOPIC_JP_MAP[name]) return LV_TOPIC_JP_MAP[name];
  if (/^[\u3040-\u30ff\u3400-\u9fffー々「」・\s]+$/.test(name)) return name;
  return 'このテーマ';
}
function lvVNLevelName(level){ return ({N5:'sơ cấp',N4:'tiền trung cấp',N3:'trung cấp',N2:'tiền cao cấp',N1:'cao cấp'})[level] || 'phù hợp cấp độ'; }
function lvCategoryForTopic(name){
  const n=(name||'').toLowerCase();
  if (/(học|giáo dục|trường|thi|jlpt|công việc|nghề|việc|会社|仕事|教育)/i.test(n)) return 'study';
  if (/(xã hội|ai|công nghệ|môi trường|kinh tế|chính trị|quyền|dữ liệu|global|xã|環境|社会|技術)/i.test(n)) return 'society';
  if (/(phim|anime|manga|âm nhạc|văn hóa|nghệ thuật|sách|lễ hội|du lịch|文化|芸術)/i.test(n)) return 'culture';
  return 'life';
}
function lvPromptSet(level,name){
  const jt=lvJPTopic(name);
  const common={
    N5:[`「${jt}」について、短い文で書いてください。`,`「${jt}」で好きなことを一つ紹介してください。`,`「${jt}」について、いつ・どこで・だれとするかを書いてください。`],
    N4:[`「${jt}」について、自分の経験を入れて書いてください。`,`「${jt}」で大切だと思うことを理由と一緒に書いてください。`,`「${jt}」について、これからしたいことを具体的に書いてください。`],
    N3:[`「${jt}」の良い点と問題点について、自分の意見を書いてください。`,`「${jt}」について、具体例を一つ挙げて考えを述べてください。`,`「${jt}」が生活に与える影響について書いてください。`],
    N2:[`「${jt}」をめぐる現状と課題について論じてください。`,`「${jt}」が社会に与える影響を、具体例を踏まえて分析してください。`,`「${jt}」に関する問題点を一つ挙げ、解決策を提案してください。`],
    N1:[`「${jt}」の本質について、抽象的な観点と具体例を交えて論じてください。`,`「${jt}」を現代社会の文脈から批判的に考察してください。`,`「${jt}」について、対立する二つの観点を踏まえたうえで自分の見解を述べてください。`]
  };
  return (common[level]||common.N3).map(jp=>({jp}));
}
const LV_EXTRA_VOCAB = {
 N5:[['今日','きょう','hôm nay'],['明日','あした','ngày mai'],['昨日','きのう','hôm qua'],['人','ひと','người'],['場所','ばしょ','địa điểm'],['時間','じかん','thời gian'],['新しい','あたらしい','mới'],['古い','ふるい','cũ'],['多い','おおい','nhiều'],['少ない','すくない','ít'],['近い','ちかい','gần'],['遠い','とおい','xa'],['便利','べんり','tiện lợi'],['有名','ゆうめい','nổi tiếng'],['大きい','おおきい','to/lớn'],['小さい','ちいさい','nhỏ'],['見る','みる','xem/nhìn'],['聞く','きく','nghe/hỏi'],['書く','かく','viết'],['話す','はなす','nói']],
 N4:[['理由','りゆう','lý do'],['経験','けいけん','kinh nghiệm'],['予定','よてい','dự định'],['必要','ひつよう','cần thiết'],['場合','ばあい','trường hợp'],['方法','ほうほう','phương pháp'],['気持ち','きもち','cảm xúc'],['意見','いけん','ý kiến'],['説明する','せつめいする','giải thích'],['紹介する','しょうかいする','giới thiệu'],['比べる','くらべる','so sánh'],['選ぶ','えらぶ','chọn'],['増える','ふえる','tăng'],['減る','へる','giảm'],['続ける','つづける','tiếp tục'],['始める','はじめる','bắt đầu'],['変わる','かわる','thay đổi'],['助ける','たすける','giúp đỡ'],['困る','こまる','gặp khó khăn'],['慣れる','なれる','quen']],
 N3:[['影響','えいきょう','ảnh hưởng'],['課題','かだい','thách thức/vấn đề'],['原因','げんいん','nguyên nhân'],['結果','けっか','kết quả'],['解決','かいけつ','giải quyết'],['意識','いしき','ý thức'],['行動','こうどう','hành động'],['社会','しゃかい','xã hội'],['将来','しょうらい','tương lai'],['状況','じょうきょう','tình hình'],['関係','かんけい','quan hệ'],['情報','じょうほう','thông tin'],['比較する','ひかくする','so sánh'],['改善する','かいぜんする','cải thiện'],['参加する','さんかする','tham gia'],['発展する','はってんする','phát triển'],['減少する','げんしょうする','giảm sút'],['増加する','ぞうかする','gia tăng'],['重視する','じゅうしする','coi trọng'],['共有する','きょうゆうする','chia sẻ']],
 N2:[['現状','げんじょう','hiện trạng'],['格差','かくさ','khoảng cách/bất bình đẳng'],['政策','せいさく','chính sách'],['制度','せいど','chế độ/hệ thống'],['構造','こうぞう','cấu trúc'],['負担','ふたん','gánh nặng'],['責任','せきにん','trách nhiệm'],['効率','こうりつ','hiệu suất'],['需要','じゅよう','nhu cầu'],['供給','きょうきゅう','nguồn cung'],['規制','きせい','quy định'],['促進する','そくしんする','thúc đẩy'],['是正する','ぜせいする','khắc phục'],['維持する','いじする','duy trì'],['検討する','けんとうする','xem xét'],['導入する','どうにゅうする','áp dụng/đưa vào'],['深刻化する','しんこくかする','trở nên nghiêm trọng'],['多様化する','たようかする','đa dạng hóa'],['持続可能','じぞくかのう','bền vững'],['具体策','ぐたいさく','biện pháp cụ thể']],
 N1:[['本質','ほんしつ','bản chất'],['概念','がいねん','khái niệm'],['普遍性','ふへんせい','tính phổ quát'],['相対性','そうたいせい','tính tương đối'],['矛盾','むじゅん','mâu thuẫn'],['葛藤','かっとう','giằng co/xung đột nội tâm'],['規範','きはん','chuẩn mực'],['倫理','りんり','đạo đức'],['権力','けんりょく','quyền lực'],['主体性','しゅたいせい','tính chủ thể'],['文脈','ぶんみゃく','bối cảnh'],['論証','ろんしょう','luận chứng'],['考察する','こうさつする','suy ngẫm/phân tích'],['批判する','ひはんする','phê phán'],['定義する','ていぎする','định nghĩa'],['象徴する','しょうちょうする','tượng trưng'],['内包する','ないほうする','bao hàm'],['帰結する','きけつする','dẫn đến kết luận'],['問い直す','といなおす','xem xét lại'],['再構築する','さいこうちくする','tái cấu trúc']]
};
const LV_GRAMMAR_POOL = {
 N5:[['〜は〜です','N1 は N2 です','A là B; dùng để giới thiệu, định nghĩa hoặc mô tả rất cơ bản.','Dùng trong tự giới thiệu, nói nghề nghiệp, quốc tịch, tính chất của đồ vật/người.'],['〜が好きです','N が好きです','Thích N; diễn tả sở thích hoặc cảm tình.','Dùng khi nói sở thích cá nhân, món ăn, môn học, người hoặc hoạt động yêu thích.'],['〜に行きます','場所 に/へ 行きます','Đi đến một địa điểm.','Dùng để viết lịch trình đơn giản: đi học, đi làm, đi chơi, đi du lịch.'],['〜を〜ます','N を Vます','Làm hành động với một đối tượng.','Dùng rất thường xuyên khi viết về thói quen: ăn cơm, học tiếng Nhật, đọc sách.'],['〜と〜','N と N','Và; nối hai danh từ.','Dùng để liệt kê người/vật cùng nhóm một cách đơn giản.'],['〜があります','N があります','Có đồ vật/sự việc.','Dùng khi nói trong phòng/công viên/thành phố có gì.'],['〜がいます','人/動物 がいます','Có người/động vật.','Dùng khi nói gia đình, bạn bè, thú cưng hoặc người ở địa điểm nào đó.']],
 N4:[['〜たことがあります','Vた + ことがあります','Đã từng làm gì; nói kinh nghiệm trong quá khứ.','Phù hợp khi kể trải nghiệm du lịch, ăn món Nhật, tham gia sự kiện.'],['〜ために','Vる/Nの + ために','Để làm gì; nêu mục đích có chủ ý.','Dùng khi viết mục tiêu học tập, sức khỏe, công việc.'],['〜ようになる','Vる/Vない + ようになる','Trở nên/bắt đầu có thể làm gì hoặc thay đổi thói quen.','Dùng để nói quá trình tiến bộ: nói được tiếng Nhật, dậy sớm hơn.'],['〜と思います','普通形 + と思います','Tôi nghĩ rằng; nêu ý kiến cá nhân.','Dùng trong bài viết ngắn để đưa nhận xét mềm mại, tự nhiên.'],['〜てみる','Vて + みる','Thử làm gì xem sao.','Dùng khi viết về điều muốn thử, món ăn, chuyến đi, sở thích mới.'],['〜ほうがいい','Vた/Vない + ほうがいい','Nên làm/không nên làm gì.','Dùng khi đưa lời khuyên trong sức khỏe, học tập, đời sống.'],['〜ながら','Vます bỏ ます + ながら','Vừa làm A vừa làm B.','Dùng cho hai hành động diễn ra đồng thời như nghe nhạc khi học.']],
 N3:[['〜によって','N + によって','Do/tùy theo/bằng cách; diễn tả nguyên nhân, phương tiện hoặc sự khác biệt.','Dùng trong bài nghị luận nhẹ khi nói ảnh hưởng của công nghệ, giáo dục, môi trường.'],['〜だけでなく〜も','A だけでなく B も','Không chỉ A mà còn B; mở rộng luận điểm.','Dùng để tăng chiều sâu cho bài viết bằng cách nêu hai mặt/hai lợi ích.'],['〜べきだ','Vる + べきだ','Nên/phải làm; thể hiện quan điểm tương đối mạnh.','Dùng khi đề xuất hành động xã hội hoặc trách nhiệm cá nhân.'],['〜一方で','普通形 + 一方で','Mặt khác/trong khi đó; so sánh hai mặt trái ngược.','Rất hữu ích khi viết ưu nhược điểm của SNS, thành phố, công việc.'],['〜に対して','N + に対して','Đối với; hướng hành động/cảm xúc/ý kiến vào đối tượng.','Dùng khi viết thái độ của xã hội đối với vấn đề nào đó.'],['〜ことによって','Vる + ことによって','Bằng việc; nhờ việc làm gì mà có kết quả.','Dùng khi nêu giải pháp và tác dụng cụ thể.'],['〜わけではない','普通形 + わけではない','Không hẳn là/không có nghĩa là.','Dùng để tránh khẳng định tuyệt đối, giúp bài viết tự nhiên hơn.']],
 N2:[['〜にもかかわらず','普通形/N + にもかかわらず','Mặc dù nhưng; kết quả trái với dự đoán.','Dùng trong văn viết khi nêu nghịch lý xã hội hoặc mâu thuẫn giữa lợi ích và vấn đề.'],['〜を踏まえて','N + を踏まえて','Dựa trên/căn cứ vào.','Dùng khi đưa đề xuất sau khi đã nhìn vào số liệu, hiện trạng, ý kiến.'],['〜に伴って','N/Vる + に伴って','Cùng với/kéo theo một thay đổi khác.','Dùng để mô tả xu hướng: già hóa, công nghệ phát triển, toàn cầu hóa.'],['〜ざるを得ない','Vない bỏ ない + ざるを得ない','Buộc phải/không thể không.','Dùng khi hoàn cảnh khiến chủ thể không còn lựa chọn khác.'],['〜をめぐって','N + をめぐって','Xoay quanh vấn đề.','Dùng khi có nhiều tranh luận, ý kiến hoặc xung đột về một chủ đề.'],['〜に基づいて','N + に基づいて','Dựa trên nền tảng/căn cứ.','Dùng trong văn viết để nói quyết định, chính sách hoặc lập luận có cơ sở.'],['〜にすぎない','N/普通形 + にすぎない','Chỉ là; nhấn mạnh mức độ thấp/giới hạn.','Dùng để phản biện khi một giải pháp hoặc kết quả chưa đủ quan trọng.']],
 N1:[['〜がゆえに','普通形/N + がゆえに','Chính vì/do; sắc thái trang trọng, văn viết.','Dùng khi phân tích nguyên nhân sâu xa trong triết học, xã hội, văn học.'],['〜にほかならない','N + にほかならない','Chính là/không gì khác ngoài.','Dùng để kết luận mạnh mẽ, khẳng định bản chất của sự việc.'],['〜ならではの','N + ならではの + N','Đặc trưng chỉ riêng N mới có.','Dùng khi bàn về văn hóa, nghệ thuật, ngôn ngữ, bản sắc.'],['〜とも〜とも言えない','A とも B とも言えない','Không thể nói hẳn là A hay B.','Dùng để diễn đạt nhận định tinh tế, tránh nhị nguyên đơn giản.'],['〜に至っては','N + に至っては','Thậm chí đến mức; nêu trường hợp cực đoan.','Dùng trong phân tích khi muốn đưa ví dụ nổi bật hoặc nghiêm trọng.'],['〜ずにはおかない','Vない bỏ ない + ずにはおかない','Nhất định sẽ/không thể không gây ra.','Dùng trong văn viết để nói tác động mạnh mẽ của sự kiện/tác phẩm.'],['〜いかんによらず','N + いかんによらず','Bất kể như thế nào.','Dùng trong văn chính luận, luật lệ, nguyên tắc, lập luận khách quan.']]
};
function lvExampleJP(level, jp, name, type, i){
  const jt=lvJPTopic(name);
  const vnTopic=name==='Chủ đề luyện viết 100'?'chủ đề này':name;
  if(type==='vocab'){
    const templates={
      N5:[`${jp}について短く話します。 (${vnTopic}: Tôi sẽ nói ngắn về chủ đề này.)`, `毎日、${jp}を使って文を書きます。 (Mỗi ngày tôi dùng từ này để viết câu.)`],
      N4:[`${jp}は私の生活と関係があります。 (${jp} có liên quan đến cuộc sống của tôi.)`, `${jt}について書くとき、${jp}は便利な言葉です。 (Khi viết về ${vnTopic}, từ này rất hữu ích.)`],
      N3:[`${jt}を考えるうえで、${jp}は重要なキーワードです。 (Khi suy nghĩ về ${vnTopic}, đây là từ khóa quan trọng.)`, `${jp}の意味を理解すると、意見をより具体的に書けます。 (Hiểu từ này giúp viết ý kiến cụ thể hơn.)`],
      N2:[`${jt}を論じる際、${jp}という観点は欠かせません。 (Khi bàn về ${vnTopic}, góc nhìn này rất cần thiết.)`, `${jp}を用いることで、文章の説得力が高まります。 (Dùng từ này giúp bài viết thuyết phục hơn.)`],
      N1:[`${jt}の本質を問うなら、${jp}という概念を避けて通れません。 (Khi hỏi về bản chất của ${vnTopic}, khó tránh khái niệm này.)`, `${jp}は抽象的な議論を支える語彙です。 (Đây là từ vựng nâng đỡ lập luận trừu tượng.)`]
    };
    return templates[level] || templates.N3;
  }
  return [];
}
function lvBuildVocab(level,name,idx){
  const pool=LV_EXTRA_VOCAB[level] || LV_EXTRA_VOCAB.N3;
  const topicJP=lvJPTopic(name);
  const first=[topicJP, topicJP, `chủ đề: ${name}`];
  const chosen=[first,...pool.slice(idx%pool.length),...pool.slice(0,idx%pool.length)].slice(0,20);
  return chosen.map((x,i)=>{
    const jp=x[0], r=x[1], vn=x[2];
    return {
      jp,r,vn,
      pos:i%3===0?'名詞':(i%3===1?'動詞/表現':'形容詞/表現'),
      collocation:`${jp}について書く・${jp}を大切にする・${jp}に関係がある`,
      context:`JLPT ${level}（${lvVNLevelName(level)}）で「${name}」について書くときに使いやすい語彙です。日常説明から意見文まで、主語・理由・具体例を補う場面で使えます。`,
      examples:lvExampleJP(level,jp,name,'vocab',i),
      nuance:`単語だけで覚えるより、「${jp}について」「${jp}を〜する」の形で覚えると作文に入れやすくなります。`
    };
  });
}
function lvBuildGrammar(level,name,idx){
  const pool=LV_GRAMMAR_POOL[level] || LV_GRAMMAR_POOL.N3;
  return pool.slice(0,7).map((g,i)=>({
    pattern:g[0], structure:g[1], meaning:g[2], context:g[3],
    examples:[
      `${lvJPTopic(name)}について書くとき、この表現を使うと自然です。 (Khi viết về ${name}, dùng mẫu này sẽ tự nhiên.)`,
      `例：${lvJPTopic(name)}は大切だと思います。 (Ví dụ: Tôi nghĩ ${name} là quan trọng.)`
    ],
    note:`Mẫu này phù hợp JLPT ${level}. Khi luyện viết, nên dùng để nối ý, đưa lý do, nêu ví dụ hoặc làm câu văn rõ logic hơn.`
  }));
}
function lvEnrichAllTopics(){
  Object.keys(TOPICS).forEach(level=>{
    TOPICS[level]=(TOPICS[level]||[]).map((t,idx)=>({
      ...t,
      jpName:lvJPTopic(t.name),
      category:lvCategoryForTopic(t.name),
      prompts:lvPromptSet(level,t.name),
      vocab:lvBuildVocab(level,t.name,idx),
      grammar:lvBuildGrammar(level,t.name,idx)
    }));
  });
}
lvEnrichAllTopics();

function renderLevels(){
  const grid=document.getElementById('level-grid'); if(!grid) return;
  grid.innerHTML=LEVELS.map(l=>`<div class="level-card level-card-clean" id="lv-${l.id}" onclick="selectLevel('${l.id}')"><div class="level-jp" style="color:${l.color}">${l.name}</div><div class="level-sub">${l.sub}</div><div class="level-mini">100 chủ đề · 20 từ · 7 mẫu</div></div>`).join('');
}
function renderTopics(){
  const all=TOPICS[state.level]||[];
  const q=(document.getElementById('topic-search')?.value||'').toLowerCase().trim();
  const filter=document.getElementById('topic-filter')?.value||'all';
  let topics=all.map((t,i)=>({...t,_idx:i})).filter(t=>{
    const matchQ=!q || `${t.name} ${t.jpName}`.toLowerCase().includes(q);
    const matchF=filter==='all' || t.category===filter;
    return matchQ && matchF;
  });
  const badge=document.getElementById('topic-level-badge'); if(badge) badge.textContent=`${state.level} · ${topics.length}/${all.length} chủ đề`;
  const grid=document.getElementById('topic-grid'); if(!grid) return;
  grid.innerHTML=topics.map(t=>`<div class="topic-card" onclick="selectTopic(${t._idx})"><div class="topic-emoji">${t.emoji}</div><div class="topic-name"><span class="topic-jp-name">${escapeHTML(t.jpName||'')}</span><span>${escapeHTML(t.name)}</span></div><div class="topic-count">3 đề · 20 từ · 7 mẫu</div></div>`).join('') || `<div class="empty-state">Không thấy chủ đề phù hợp. Thử từ khóa khác nhé.</div>`;
}
function renderPrompt(){
  const p=state.topic.prompts[state.promptIdx%state.topic.prompts.length];
  const title=state.topic.jpName || lvJPTopic(state.topic.name);
  document.getElementById('writing-prompt').innerHTML=`<div class="prompt-label">✏ テーマ：${escapeHTML(title)} · 課題 ${state.promptIdx+1}/${state.topic.prompts.length}</div><div class="prompt-text">${escapeHTML(p.jp)}</div><div class="prompt-switcher">${state.topic.prompts.map((_,i)=>`<button class="prompt-pill ${i===state.promptIdx?'active':''}" onclick="choosePrompt(${i})">課題 ${i+1}</button>`).join('')}</div>`;
}
function lvOpenDetail(type,item,topicName){
  const isV=type==='vocab';
  const html=isV?`
    <div class="modal-kicker">📖 Từ vựng · ${escapeHTML(state.level||'JLPT')}</div>
    <h2 class="modal-title-jp">${escapeHTML(item.jp)}</h2>
    <div class="modal-reading">${escapeHTML(item.r||'')}</div>
    <div class="modal-meaning">${escapeHTML(item.vn||'')}</div>
    <div class="modal-grid">
      <section><h4>Loại từ / sắc thái</h4><p>${escapeHTML(item.pos||'表現')}</p><p>${escapeHTML(item.nuance||'')}</p></section>
      <section><h4>Bối cảnh sử dụng</h4><p>${escapeHTML(item.context||'')}</p></section>
      <section class="wide"><h4>Collocation hay gặp</h4><div class="modal-chips">${String(item.collocation||'').split('・').map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div></section>
      <section class="wide"><h4>Ví dụ thực tế</h4><ol class="modal-examples">${(item.examples||[]).map(e=>`<li>${escapeHTML(e)}</li>`).join('')}</ol></section>
    </div>`:`
    <div class="modal-kicker">🔧 Ngữ pháp · ${escapeHTML(state.level||'JLPT')}</div>
    <h2 class="modal-title-jp">${escapeHTML(item.pattern)}</h2>
    <div class="modal-meaning">${escapeHTML(item.meaning||'')}</div>
    <div class="modal-grid">
      <section><h4>Cấu trúc</h4><p class="structure-line">${escapeHTML(item.structure||'')}</p></section>
      <section><h4>Bối cảnh dùng</h4><p>${escapeHTML(item.context||'')}</p></section>
      <section class="wide"><h4>Ý nghĩa chi tiết</h4><p>${escapeHTML(item.note||item.meaning||'')}</p></section>
      <section class="wide"><h4>Ví dụ có dịch tiếng Việt</h4><ol class="modal-examples">${(item.examples||[]).map(e=>`<li>${escapeHTML(e)}</li>`).join('')}</ol></section>
    </div>`;
  const modal=document.getElementById('learning-modal'), content=document.getElementById('learning-modal-content');
  if(content) content.innerHTML=html;
  modal?.classList.remove('step-hidden');
}
function closeLearningModal(e){ if(e && e.target && e.target.id!=='learning-modal') return; document.getElementById('learning-modal')?.classList.add('step-hidden'); }
function patchVocabDetail(v){ return `<div class="expand-detail"><div><b>Cách đọc:</b> ${escapeHTML(v.r||'')}</div><div><b>Nghĩa:</b> ${escapeHTML(v.vn||'')}</div><div><b>Collocation:</b> ${escapeHTML(v.collocation||'')}</div><div><b>Bối cảnh:</b> ${escapeHTML(v.context||'')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('vocab', ${escapeHTML(JSON.stringify(v))})">Xem giải thích đẹp hơn</button></div>`; }
function patchGrammarDetail(g){ return `<div class="expand-detail grammar-expand"><div><b>Cấu trúc:</b> ${escapeHTML(g.structure||'')}</div><div><b>Nghĩa:</b> ${escapeHTML(g.meaning||'')}</div><div><b>Bối cảnh:</b> ${escapeHTML(g.context||'')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('grammar', ${escapeHTML(JSON.stringify(g))})">Xem giải thích đẹp hơn</button></div>`; }
function renderSidebar(){
  const t=state.topic;
  document.getElementById('sidebar-topic').textContent=`${t.emoji} ${t.jpName||lvJPTopic(t.name)}`;
  document.getElementById('sidebar-level').textContent=`${state.level} · ${t.name}`;
  document.getElementById('vocab-list').innerHTML=t.vocab.map((v,idx)=>`<div class="vocab-item expandable-item" onclick="toggleLearningItem(this)"><div class="learning-row"><div><div class="vocab-jp">${escapeHTML(v.jp)}</div><div class="vocab-reading">${escapeHTML(v.r)}</div></div><div class="vocab-vn">${escapeHTML(v.vn)}</div></div><div class="expand-detail"><div><b>Collocation:</b> ${escapeHTML(v.collocation||'')}</div><div><b>Bối cảnh:</b> ${escapeHTML(v.context||'')}</div><div class="mini-examples"><b>Ví dụ:</b><br>${(v.examples||[]).map((e,i)=>`${i+1}. ${escapeHTML(e)}`).join('<br>')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('vocab', state.topic.vocab[${idx}])">Mở popup chi tiết</button></div></div>`).join('');
  document.getElementById('vocab-count').textContent=t.vocab.length;
  document.getElementById('grammar-list').innerHTML=t.grammar.map((g,idx)=>`<div class="grammar-item expandable-item" onclick="toggleLearningItem(this)"><div class="grammar-pattern">${escapeHTML(g.pattern)}</div><div class="grammar-meaning">${escapeHTML(g.meaning)}</div><div class="expand-detail grammar-expand"><div><b>Cấu trúc:</b> ${escapeHTML(g.structure)}</div><div><b>Bối cảnh:</b> ${escapeHTML(g.context)}</div><div class="mini-examples"><b>Ví dụ:</b><br>${(g.examples||[]).map((e,i)=>`${i+1}. ${escapeHTML(e)}`).join('<br>')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('grammar', state.topic.grammar[${idx}])">Mở popup chi tiết</button></div></div>`).join('');
  document.getElementById('grammar-count').textContent=t.grammar.length;
}
function getSuggestions(){
  const input=document.getElementById('free-topic-input').value.trim();
  if(!input) return document.getElementById('free-topic-input').focus();
  state.freeTopic=input;
  state.topic={...patchBuildTopic(state.level,input,FREE_TOPIC_TAGS_20.indexOf(input)+11), jpName:lvJPTopic(input), category:lvCategoryForTopic(input), prompts:lvPromptSet(state.level,input), vocab:lvBuildVocab(state.level,input,7), grammar:lvBuildGrammar(state.level,input,7), emoji:'✏️'};
  state.promptIdx=0; renderSidebar(); renderPrompt(); showStep('step-writing'); scrollToStep('step-writing'); clearFeedback();
}
function goPractice(){
  document.getElementById('library-section')?.classList.add('step-hidden');
  const target = state.level ? 'step-mode' : 'step-level';
  if(state.level) showStep('step-mode');
  document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'});
  setActiveNav('practice');
}
function setActiveNav(kind){
  document.querySelectorAll('.nav-link').forEach(a=>a.classList.remove('active'));
  const labels={home:'Trang chủ',practice:'Luyện viết',vocab:'Từ vựng',grammar:'Ngữ pháp'};
  document.querySelectorAll('.nav-link').forEach(a=>{ if(a.textContent.trim()===labels[kind]) a.classList.add('active'); });
}
function goHome(){
  document.getElementById('library-section')?.classList.add('step-hidden');
  ['step-mode','step-topics','step-free-input','step-drill','step-writing'].forEach(id=>document.getElementById(id)?.classList.add('step-hidden'));
  document.getElementById('hero-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  setActiveNav('home');
}
function setUILanguage(lang,btn){
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  btn?.classList.add('active');
  const label={en:'English UI selected',zh:'已选择中文界面',ja:'日本語UIを選択しました',vi:'Đã chọn giao diện tiếng Việt'}[lang] || 'Language selected';
  const el=document.querySelector('.hero-badge'); if(el) el.textContent=label;
}

const libraryState={type:'vocab',level:'N5',topicIdx:null};
function openLibrary(type='vocab'){
  libraryState.type=type;
  document.getElementById('library-section')?.classList.remove('step-hidden');
  ['step-mode','step-topics','step-free-input','step-drill','step-writing'].forEach(id=>document.getElementById(id)?.classList.add('step-hidden'));
  renderLibraryLevels(); renderLibraryTopics();
  document.getElementById('library-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  setActiveNav(type);
}
function renderLibraryLevels(){
  const wrap=document.getElementById('library-levels'); if(!wrap) return;
  wrap.innerHTML=LEVELS.map(l=>`<button class="library-level ${libraryState.level===l.id?'active':''}" onclick="libraryState.level='${l.id}'; libraryState.topicIdx=null; renderLibraryLevels(); renderLibraryTopics();">${l.name}<span>${l.sub}</span></button>`).join('');
  document.getElementById('library-tab-vocab')?.classList.toggle('active',libraryState.type==='vocab');
  document.getElementById('library-tab-grammar')?.classList.toggle('active',libraryState.type==='grammar');
  const title=document.getElementById('library-title'), desc=document.getElementById('library-desc');
  if(title) title.textContent=libraryState.type==='vocab'?'Từ vựng theo cấp độ':'Ngữ pháp theo cấp độ';
  if(desc) desc.textContent=libraryState.type==='vocab'?'Mỗi cấp có 100 chủ đề, mỗi chủ đề 20 từ với collocation, bối cảnh và ví dụ.':'Mỗi cấp có 100 chủ đề, mỗi chủ đề 7 mẫu ngữ pháp với cấu trúc, nghĩa và ví dụ.';
}
function renderLibraryTopics(){
  const q=(document.getElementById('library-search')?.value||'').toLowerCase().trim();
  const sort=document.getElementById('library-sort')?.value||'default';
  let topics=(TOPICS[libraryState.level]||[]).map((t,i)=>({...t,_idx:i})).filter(t=>!q || `${t.name} ${t.jpName} ${t.vocab.map(v=>v.jp+v.vn).join(' ')} ${t.grammar.map(g=>g.pattern+g.meaning).join(' ')}`.toLowerCase().includes(q));
  if(sort==='az') topics.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='za') topics.sort((a,b)=>b.name.localeCompare(a.name));
  const grid=document.getElementById('library-topic-grid'); if(!grid) return;
  grid.innerHTML=topics.map(t=>`<button class="library-topic ${libraryState.topicIdx===t._idx?'active':''}" onclick="libraryState.topicIdx=${t._idx}; renderLibraryTopics(); renderLibraryItems();"><span>${t.emoji}</span><b>${escapeHTML(t.jpName)}</b><small>${escapeHTML(t.name)}</small></button>`).join('');
  if(libraryState.topicIdx==null && topics[0]) libraryState.topicIdx=topics[0]._idx;
  renderLibraryItems();
}
function renderLibraryItems(){
  const box=document.getElementById('library-items'); if(!box) return;
  const topic=(TOPICS[libraryState.level]||[])[libraryState.topicIdx];
  if(!topic){ box.innerHTML='<div class="empty-state">Chọn một chủ đề để xem nội dung.</div>'; return; }
  const items=libraryState.type==='vocab'?topic.vocab:topic.grammar;
  box.innerHTML=`<div class="library-items-head"><div><h3>${topic.emoji} ${escapeHTML(topic.jpName)}</h3><p>${escapeHTML(topic.name)} · ${libraryState.level} · ${items.length} mục</p></div></div><div class="library-card-grid">${items.map((it,i)=>libraryState.type==='vocab'?`<button class="library-item-card" onclick="lvOpenDetail('vocab', TOPICS['${libraryState.level}'][${libraryState.topicIdx}].vocab[${i}])"><b>${escapeHTML(it.jp)}</b><span>${escapeHTML(it.r)}</span><small>${escapeHTML(it.vn)}</small></button>`:`<button class="library-item-card grammar" onclick="lvOpenDetail('grammar', TOPICS['${libraryState.level}'][${libraryState.topicIdx}].grammar[${i}])"><b>${escapeHTML(it.pattern)}</b><small>${escapeHTML(it.meaning)}</small></button>`).join('')}</div>`;
}

function buildDrillSentence(level, topic, n){
  const jpTopic=topic.jpName||lvJPTopic(topic.name);
  const g=topic.grammar[n%topic.grammar.length];
  const patterns={
    N5:[[`Tôi viết về ${topic.name}.`,`私は${jpTopic}について書きます。`],[`Tôi thích ${topic.name}.`,`私は${jpTopic}が好きです。`],[`${topic.name} rất quan trọng.`,`${jpTopic}は大切です。`]],
    N4:[[`Tôi đã từng viết về ${topic.name}.`,`私は${jpTopic}について書いたことがあります。`],[`Tôi học từ vựng để viết về ${topic.name}.`,`${jpTopic}について書くために語彙を勉強します。`],[`Tôi nghĩ ${topic.name} rất thú vị.`,`${jpTopic}はとても面白いと思います。`]],
    N3:[[`Không chỉ ${topic.name} mà ví dụ cụ thể cũng quan trọng.`,`${jpTopic}だけでなく、具体例も大切です。`],[`Nhờ hiểu ${topic.name}, bài viết trở nên rõ hơn.`,`${jpTopic}を理解することによって、文章がより明確になります。`],[`Chúng ta nên suy nghĩ về ${topic.name}.`,`${jpTopic}について考えるべきです。`]],
    N2:[[`Dựa trên hiện trạng của ${topic.name}, cần đề xuất giải pháp.`,`${jpTopic}の現状を踏まえて、解決策を提案する必要があります。`],[`Cùng với sự thay đổi của ${topic.name}, xã hội cũng thay đổi.`,`${jpTopic}の変化に伴って、社会も変わっています。`],[`Mặc dù ${topic.name} có lợi ích, cũng còn vấn đề.`,`${jpTopic}には利点があるにもかかわらず、課題も残っています。`]],
    N1:[[`Chính vì ${topic.name} phức tạp nên cần suy ngẫm sâu.`,`${jpTopic}が複雑であるがゆえに、深く考察する必要があります。`],[`${topic.name} không gì khác ngoài một vấn đề phản ánh xã hội hiện đại.`,`${jpTopic}は現代社会を映し出す問題にほかなりません。`],[`Không thể nói ${topic.name} chỉ là tốt hay xấu.`,`${jpTopic}は良いとも悪いとも言えません。`]]
  };
  const pair=(patterns[level]||patterns.N3)[n%3];
  return n%2===0?{direction:'vn-jp',source:pair[0],answer:pair[1],hint:`Ngữ pháp: ${g.pattern}｜Nghĩa: ${g.meaning}`}:{direction:'jp-vn',source:pair[1],answer:pair[0],hint:`文法: ${g.pattern}｜${g.meaning}`};
}
function renderDrillTopics(){
  const grid=document.getElementById('drill-topic-grid'); if(!grid) return;
  const q=(document.getElementById('drill-topic-search')?.value||'').toLowerCase().trim();
  const topics=(TOPICS[state.level]||[]).map((t,i)=>({...t,_idx:i})).filter(t=>!q || `${t.name} ${t.jpName}`.toLowerCase().includes(q));
  grid.innerHTML=topics.map(t=>`<button class="drill-topic-chip ${state.drill?.topicIdx===t._idx?'active':''}" onclick="selectDrillTopic(${t._idx})"><span>${t.emoji}</span><b>${escapeHTML(t.jpName)}</b><small>40 câu</small></button>`).join('');
}
function selectDrillTopic(idx){
  const topic=(TOPICS[state.level]||[])[idx]; if(!topic) return;
  state.drill={topicIdx:idx,idx:0,correct:0,unlockedNext:false,items:Array.from({length:40},(_,i)=>buildDrillSentence(state.level,topic,i))};
  renderDrillTopics(); renderDrill();
}
function initDrill(){
  const first=0;
  state.drill={topicIdx:first,idx:0,correct:0,unlockedNext:false,items:Array.from({length:40},(_,i)=>buildDrillSentence(state.level,TOPICS[state.level][first],i))};
  renderDrillTopics(); renderDrill();
}
function renderDrill(){
  const d=state.drill,item=d.items[d.idx], topic=TOPICS[state.level][d.topicIdx];
  document.getElementById('drill-level-badge').textContent=`${state.level} · ${topic.jpName}`;
  document.getElementById('drill-progress-text').textContent=`Câu ${d.idx+1}/${d.items.length}`;
  document.getElementById('drill-streak').textContent=d.correct?`Đúng ${d.correct}`:'';
  document.getElementById('drill-progress-fill').style.width=`${((d.idx+1)/d.items.length)*100}%`;
  document.getElementById('drill-direction').textContent=item.direction==='vn-jp'?'🇻🇳 → 🇯🇵 Dịch sang tiếng Nhật':'🇯🇵 → 🇻🇳 Dịch sang tiếng Việt';
  document.getElementById('drill-sentence').textContent=item.source;
  document.getElementById('drill-vocab-hint').textContent=item.hint;
  document.getElementById('drill-answer').value=''; document.getElementById('drill-char-count').textContent='0 ký tự'; document.getElementById('drill-feedback').innerHTML=''; document.getElementById('drill-next-btn').style.display='none'; d.unlockedNext=false;
}
document.addEventListener('DOMContentLoaded',()=>{ renderLevels(); renderFreeTags(); });

// ============================================================
// PATCH 2026-05-C — Ensure 100 topics/level when starting from the original upload
// ============================================================
var FREE_TOPIC_TAGS_20 = ['Du lịch Nhật Bản','Gia đình','Công việc','Phim anime','Thời tiết','Sức khỏe','Mua sắm','Học tiếng Nhật','Mạng xã hội','Môi trường','Giáo dục','Bạn bè','Ẩm thực','Âm nhạc','Thể thao','Công nghệ','Văn hóa Nhật','Ước mơ','Cuộc sống đô thị','Tương lai'];
function renderFreeTags(){
  const wrap=document.querySelector('.free-examples'); if(!wrap) return;
  wrap.innerHTML='<span class="free-ex-label">20 tag gợi ý:</span>'+FREE_TOPIC_TAGS_20.map(tag=>`<button class="quick-chip" onclick="setFreeTopic('${tag.replace(/'/g,"\\'")}')">${escapeHTML(tag)}</button>`).join('');
}
function lvJPTopic(name){
  if (LV_TOPIC_JP_MAP[name]) return LV_TOPIC_JP_MAP[name];
  if (/^[\u3040-\u30ff\u3400-\u9fffー々「」・\s0-9０-９一二三四五六七八九十百]+$/.test(name)) return name;
  return 'このテーマ';
}
const LV_SEED_NAMES = {
  N5:['自己紹介','家族','友達','学校','教室','先生','好きな科目','私の一日','朝','夜','週末','趣味','音楽','映画','アニメ','漫画','スポーツ','サッカー','買い物','服','食べ物','飲み物','朝ごはん','昼ごはん','晩ごはん','レストラン','カフェ','簡単な料理','果物','野菜','天気','春','夏','秋','冬','誕生日','休みの日','夏休み','近くへの旅行','駅','バス','散歩','自転車','私の家','私の部屋','私の町','公園','スーパー','本屋','病院','銀行','郵便局','ホテル','動物','ペット','猫','犬','花','色','数','時間','予定','通学','通勤','遊びに行くこと','友達に会うこと','電話','メッセージ','写真','プレゼント','お金','健康','病気','軽い運動','睡眠','早起き','掃除','洗濯','シャワー','歯磨き','読書','日記','日本語の勉強','好きな漢字','ひらがなとカタカナ','コンビニ','好きな日本料理','ベトナム','日本','言語','小さな夢','好きな人','嫌いなこと','楽しい思い出','雨の日','晴れの日','海','山','祭り','旧正月'],
  N4:['旅行','仕事','健康','映画と音楽','買い物','毎日の習慣','週末の予定','思い出に残る休暇','日本語学習の経験','今年の目標','アルバイト','理想の会社','同僚','良い上司','就職面接','簡単なメール','約束','謝罪と感謝','人を助けること','一人暮らし','部屋を借りること','引っ越し','家事','節約','オンラインショッピング','商品の比較','お土産','好きなレストラン','料理のレシピ','健康的な食生活','運動','風邪','病院へ行くこと','睡眠','軽いストレス','電車','道に迷うこと','道を尋ねること','ホテル予約','空港','日本旅行の計画','日本の祭り','贈り物の文化','あいさつの習慣','現代の家族','親友','近所の人','ペットを飼うこと','SNS','スマートフォン','便利なアプリ','オンライン学習','動画','ニュース','新しい趣味','楽器','スポーツ','登山','キャンプ','海','写真撮影','日記','好きな本','最近見た映画','好きな歌','おすすめのアニメ','おすすめの漫画','住みやすい町','田舎','公共交通機関','リサイクル','節電','悪い天気','好きな季節','学校行事','試験','奨学金','クラブ活動','良い先生','難しい科目','将来','将来の夢','影響を受けた人','子どものころの思い出','過去の失敗','挑戦したいこと','やめたい習慣','良い習慣','忙しい日','リラックスする日','友達へのメッセージ','友達を誘うこと','約束を断ること','お願いすること','日本への印象','ベトナムと日本の比較','JLPTの目標','学習計画','作文テーマ九十九','作文テーマ百'],
  N3:['環境','教育','日本文化','技術とSNS','都市生活','チームワーク','コミュニケーション能力','時間管理','学習のプレッシャー','仕事のストレス','生活のバランス','職業選択','転職','リモートワーク','外国語学習','自主学習','日本留学','奨学金','試験制度','理想の教師','未来の学校','読書','ニュース習慣','フェイクニュース','情報セキュリティ','スマホ依存','オンラインショッピング','電子決済','接客','企業文化','上下関係','大人になってからの友達','家族とキャリア','晩婚化','子育て','メンタルヘルス','運動と規律','健康的な食生活','十分な睡眠','持続可能な旅行','一人旅','旅行の思い出','祭り文化','公共マナー','日本の電車','時間厳守','学生のアルバイト','ボランティア','地域活動','動物保護','リサイクル','気候変動','省エネルギー','緑地','都市交通','渋滞','都市の住まい','田舎暮らし','都市への移住','伝統料理','ファストフード','カフェと仕事','週末の娯楽','アニメと大衆文化','癒やしの音楽','ドキュメンタリー','スポーツと社会','オリンピック','長期目標','成功とは何か','失敗と学び','自信','個人の動機','自己管理','賢い消費','小さな投資','世代間ギャップ','女性の役割','ジェンダー平等','高齢者','高齢化社会','介護ロボット','生活の中のAI','仕事の未来','コンテンツ制作','動画で学ぶこと','国際的な仕事','文化の違い','カルチャーショック','言語と思考','翻訳','ブログを書くこと','プレゼンテーション','議論','個人の意見','社会ニュース','地域問題','理想の都市','ミニマルな生活','日常の幸せ'],
  N2:['社会経済','科学と未来','人間関係','グローバル化','少子高齢化','労働力不足','経済格差','社会福祉','教育政策','試験改革','大学と就職','二十一世紀のスキル','リモートワーク','労働生産性','残業文化','ワークライフバランス','リーダーシップ','職業倫理','リスク管理','起業','イノベーション','AIと雇用','自動化','個人データ','プライバシー','サイバーセキュリティ','フェイクニュースとメディア','オンライン上の言論の自由','SNSプラットフォーム','デジタル依存','遠隔医療','医療技術','医療倫理','気候変動','再生可能エネルギー','環境政策','循環型経済','持続可能な消費','企業責任','オーバーツーリズム','文化保護','伝統文化','大衆文化','ソフトパワー','国際交流','労働移民','多文化共生','言語の壁','外国語教育','都市と地方の格差','住宅と人口','公共交通機関','都市計画','公共空間','社会的孤立','メンタルヘルス','社会的ストレス','現代の家族','低出生率','ジェンダー役割','機会の平等','子どもの教育','子育て','高齢者と社会','介護','地域ボランティア','市民倫理','地方民主主義','社会参加','税制','最低賃金','非正規雇用','シェアリングエコノミー','オンライン消費','暗号資産','キャッシュレス','サプライチェーン','食料危機','食品安全','スマート農業','自然災害','危機管理','緊急時の情報発信','防災教育','宇宙研究','グリーンテクノロジー','電気自動車','スマートシティ','サービスロボット','生涯学習','批判的思考力','メディアリテラシー','アカデミックライティング','読者を説得すること','社会的議論','政策提案','原因分析','観点の比較','日本の未来','ベトナムの未来'],
  N1:['哲学と思考','政治と社会','文学と芸術','幸福の本質','自由と責任','道徳と法律','社会正義','権力と透明性','現代民主主義','個人主義','共同体主義','民族的アイデンティティ','歴史的記憶','文化遺産','文化のグローバル化','言語と権力','批判的思考','知識と偏見','メディアにおける真実','ポスト真実','AIと人間性','AI倫理','自動化と労働の尊厳','監視技術','人権としてのプライバシー','生命と倫理','再生医療','長寿と生の意味','環境と世代間責任','持続可能な発展','気候正義','消費主義','ミニマリズムと過剰','危機における芸術','社会を映す文学','批評の役割','伝統美学','現代アート','表現の自由','検閲と責任','リベラルアーツ教育','社会における大学','専門知','学問と応用','移民とアイデンティティ','多文化と包摂','国家と国境','国際秩序','紛争と平和','文化外交','知識経済','プラットフォーム資本主義','構造的不平等','福祉と自助','感情労働','現代の孤独','流動的な人間関係','ポストモダンの家族','ジェンダーと権力','身体と社会','現代における宗教','儀礼と共同体','記憶としての都市','建築と人間','災害と集合的記憶','リスク社会','危機管理','証拠に基づく政策','データと倫理','アルゴリズムと偏見','人間の創造性','文化翻訳','比較文学','日本語と思考','社会的ディスコース','日常のメタファー','美とは何か','善とは何か','自由意志','個人の責任','許しと正義','記憶と忘却','不確実性の中の希望','教育の未来','労働の未来','国家の未来','芸術の未来','言語の未来','技術批判','デジタル生活','仮想共同体','社会的信頼','正当性','価値体系','妥協と対話','コミュニケーションにおける沈黙','普遍性と相対性','書くことの意味']
};
function lvMakeTopic(level,name,idx){
  return {name, jpName:lvJPTopic(name), emoji:(typeof PATCH_EMOJIS !== 'undefined' ? PATCH_EMOJIS[idx%PATCH_EMOJIS.length] : ['🌸','📚','✏️','🎧','🎬','🍱','🏫','💼','🌍','🧠','📱','🚆','🏙️','🤝','🎯','☕','🏃','🛍️','🗾','✨'][idx%20]), category:lvCategoryForTopic(name), prompts:lvPromptSet(level,name), vocab:lvBuildVocab(level,name,idx), grammar:lvBuildGrammar(level,name,idx)};
}
function patchBuildTopic(level,input,idx){ return lvMakeTopic(level,input,idx||0); }
function lvEnsure100Topics(){
  ['N5','N4','N3','N2','N1'].forEach(level=>{
    const current=(TOPICS[level]||[]).map(t=>t.name);
    const pool=[...current,...(LV_SEED_NAMES[level]||[])];
    const seen=new Set(), names=[];
    pool.forEach(n=>{ if(n&&!seen.has(n)){seen.add(n); names.push(n);} });
    let i=names.length+1; while(names.length<100){ names.push(`作文テーマ${String(i).padStart(2,'0')}`); i++; }
    TOPICS[level]=names.slice(0,100).map((n,idx)=>lvMakeTopic(level,n,idx));
  });
}
lvEnsure100Topics();

// Rebind enhanced free suggestion after all helpers exist.
function getSuggestions(){
  const input=document.getElementById('free-topic-input').value.trim();
  if(!input) return document.getElementById('free-topic-input').focus();
  state.freeTopic=input;
  state.topic=lvMakeTopic(state.level,input,FREE_TOPIC_TAGS_20.indexOf(input)+11);
  state.topic.emoji='✏️';
  state.promptIdx=0; renderSidebar(); renderPrompt(); showStep('step-writing'); scrollToStep('step-writing'); clearFeedback();
}

// Utility fallback for original upload.
function escapeHTML(str=''){
  return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function toggleLearningItem(el){ el.classList.toggle('expanded'); }

// ============================================================
// PATCH 2026-05-D — Bugfix UI language, 300 drill, compact expandable learning cards, clean library modal
// ============================================================
state.uiLang = state.uiLang || 'vi';
state.drill = state.drill || null;

const UI_TEXT = {
  vi: {
    navHome:'Trang chủ', navPractice:'Luyện viết', navVocab:'Từ vựng', navGrammar:'Ngữ pháp',
    badge:'日本語練習', heroTitle:'Luyện viết tiếng Nhật<br><span class="gradient-text">thông minh & hiệu quả</span>',
    heroSub:'Chọn cấp độ JLPT, chọn dạng luyện tập, xem gợi ý từ vựng/ngữ pháp và nhận feedback sau khi viết.',
    cta:'Bắt đầu luyện tập →', statLevel:'cấp độ', statTopic:'chủ đề/cấp', statAI:'feedback',
    stepLevel:'Chọn cấp độ', stepLevelDesc:'Mỗi cấp có chủ đề, từ vựng và ngữ pháp phù hợp',
    stepMode:'Chọn hình thức luyện tập', stepModeDesc:'Ba chế độ rõ ràng cho từng mục tiêu luyện viết',
    modeTopic:'Viết theo chủ đề', modeTopicDesc:'Chọn 1 trong 100 chủ đề/cấp, xem từ vựng và ngữ pháp rồi viết theo đề.', modeTopicTag:'Học theo lộ trình',
    modeFree:'Luyện viết tự do', modeFreeDesc:'Nhập chủ đề bạn muốn luyện. Hệ thống tạo 3 đề tiếng Nhật kèm gợi ý.', modeFreeTag:'Viết theo ý bạn',
    modeDrill:'Luyện viết 2 chiều', modeDrillDesc:'300 câu/cấp, dịch Việt↔Nhật từ dễ đến khó và có chấm điểm.', modeDrillTag:'Luyện phản xạ',
    topicTitle:'Chọn chủ đề', topicDesc:'100 chủ đề/cấp, có thanh cuộn để chọn nhanh', topicSearch:'Tìm chủ đề: 家族, 仕事, AI...',
    freeTitle:'Nhập chủ đề muốn viết', freeDesc:'Chọn tag hoặc nhập chủ đề riêng. Đề bài sẽ hiển thị bằng tiếng Nhật, bên dưới có bản dịch tiếng Việt.', freePlaceholder:'Ví dụ: Kỳ nghỉ hè, Sở thích, Thức ăn yêu thích...', suggest:'Tạo đề bài ✨', freeTags:'20 tag gợi ý:',
    currentTopic:'Chủ đề đang luyện', vocab:'Từ vựng', grammar:'Ngữ pháp', changeTopic:'← Đổi chủ đề', submit:'Nộp bài & nhận feedback ↗', clear:'Xóa', chars:'ký tự',
    libraryVocab:'Từ vựng theo cấp độ', libraryGrammar:'Ngữ pháp theo cấp độ', libraryDesc:'Chọn cấp độ, chọn chủ đề rồi bấm vào từng mục để xem giải thích chi tiết.',
    searchLibrary:'Tìm chủ đề, từ vựng, ngữ pháp...', sortDefault:'Sắp xếp mặc định', sortAZ:'A → Z', sortZA:'Z → A',
    drillTitle:'300 câu luyện dịch', drillDesc:'Tự động trộn chủ đề trong cấp độ đã chọn. Câu sau sẽ khó dần.', check:'Kiểm tra ↗', previous:'← Câu trước', skip:'Bỏ qua', next:'Câu tiếp theo →', backMode:'⬅ Đổi chế độ'
  },
  en: {
    navHome:'Home', navPractice:'Writing', navVocab:'Vocabulary', navGrammar:'Grammar',
    badge:'Japanese practice', heroTitle:'Japanese writing practice<br><span class="gradient-text">smart & effective</span>',
    heroSub:'Choose a JLPT level, pick a practice mode, review vocabulary/grammar hints, then get feedback after writing.',
    cta:'Start practice →', statLevel:'levels', statTopic:'topics/level', statAI:'feedback',
    stepLevel:'Choose level', stepLevelDesc:'Each level has matching topics, vocabulary and grammar',
    stepMode:'Choose practice mode', stepModeDesc:'Three clear modes for different writing goals',
    modeTopic:'Topic writing', modeTopicDesc:'Pick 1 of 100 topics per level, review hints, then write from a prompt.', modeTopicTag:'Structured path',
    modeFree:'Free writing', modeFreeDesc:'Enter any topic. The app creates 3 Japanese prompts with suggestions.', modeFreeTag:'Your own topic',
    modeDrill:'Two-way writing', modeDrillDesc:'300 sentences per level. Translate Vietnamese↔Japanese from easy to hard, with scoring.', modeDrillTag:'Fast drills',
    topicTitle:'Choose a topic', topicDesc:'100 topics per level with an internal scroll area', topicSearch:'Search topics: 家族, 仕事, AI...',
    freeTitle:'Enter a writing topic', freeDesc:'Pick a tag or type your own topic. Prompts appear in Japanese with a gray Vietnamese translation below.', freePlaceholder:'Example: Summer vacation, Hobbies, Favorite food...', suggest:'Create prompts ✨', freeTags:'20 suggested tags:',
    currentTopic:'Current topic', vocab:'Vocabulary', grammar:'Grammar', changeTopic:'← Change topic', submit:'Submit & get feedback ↗', clear:'Clear', chars:'characters',
    libraryVocab:'Vocabulary by level', libraryGrammar:'Grammar by level', libraryDesc:'Choose a level and topic, then tap an item to view details.',
    searchLibrary:'Search topics, vocabulary, grammar...', sortDefault:'Default order', sortAZ:'A → Z', sortZA:'Z → A',
    drillTitle:'300 translation drills', drillDesc:'Topics are mixed automatically within the selected level. Later sentences get harder.', check:'Check ↗', previous:'← Previous', skip:'Skip', next:'Next sentence →', backMode:'⬅ Change mode'
  },
  ja: {
    navHome:'ホーム', navPractice:'作文練習', navVocab:'語彙', navGrammar:'文法',
    badge:'日本語練習', heroTitle:'日本語作文を<br><span class="gradient-text">効率よく練習</span>',
    heroSub:'JLPTレベルを選び、練習形式を選択し、語彙・文法を確認してから作文できます。',
    cta:'練習を始める →', statLevel:'レベル', statTopic:'テーマ/レベル', statAI:'添削',
    stepLevel:'レベルを選ぶ', stepLevelDesc:'各レベルに合ったテーマ・語彙・文法を用意しています',
    stepMode:'練習形式を選ぶ', stepModeDesc:'目的に合わせて三つのモードから選べます',
    modeTopic:'テーマ別作文', modeTopicDesc:'各レベル100テーマから選び、語彙と文法を確認して作文します。', modeTopicTag:'体系的に学ぶ',
    modeFree:'自由作文', modeFreeDesc:'好きなテーマを入力すると、日本語の課題とヒントを作成します。', modeFreeTag:'自由に書く',
    modeDrill:'双方向作文', modeDrillDesc:'各レベル300文。ベトナム語↔日本語を易しい順に翻訳し、採点します。', modeDrillTag:'反射練習',
    topicTitle:'テーマを選ぶ', topicDesc:'各レベル100テーマ。内部スクロールで素早く選択できます', topicSearch:'テーマ検索：家族、仕事、AI...',
    freeTitle:'作文テーマを入力', freeDesc:'タグを選ぶか自由に入力してください。課題は日本語、下にベトナム語訳を表示します。', freePlaceholder:'例：夏休み、趣味、好きな食べ物...', suggest:'課題を作成 ✨', freeTags:'おすすめタグ20個:',
    currentTopic:'練習中のテーマ', vocab:'語彙', grammar:'文法', changeTopic:'← テーマ変更', submit:'提出してフィードバック ↗', clear:'消す', chars:'文字',
    libraryVocab:'レベル別語彙', libraryGrammar:'レベル別文法', libraryDesc:'レベルとテーマを選び、項目をタップして詳しい説明を確認します。',
    searchLibrary:'テーマ・語彙・文法を検索...', sortDefault:'標準順', sortAZ:'A → Z', sortZA:'Z → A',
    drillTitle:'300文翻訳練習', drillDesc:'選択したレベル内でテーマを自動的に混ぜます。後半ほど難しくなります。', check:'確認 ↗', previous:'← 前の文', skip:'スキップ', next:'次の文 →', backMode:'⬅ モード変更'
  },
  zh: {
    navHome:'首页', navPractice:'写作练习', navVocab:'词汇', navGrammar:'语法',
    badge:'日语练习', heroTitle:'日语写作练习<br><span class="gradient-text">智能又高效</span>',
    heroSub:'选择 JLPT 等级和练习模式，查看词汇/语法提示，写完后获得反馈。',
    cta:'开始练习 →', statLevel:'等级', statTopic:'主题/等级', statAI:'反馈',
    stepLevel:'选择等级', stepLevelDesc:'每个等级都有对应的主题、词汇和语法',
    stepMode:'选择练习方式', stepModeDesc:'三种模式对应不同写作目标',
    modeTopic:'按主题写作', modeTopicDesc:'每级100个主题，先看词汇语法，再按题目写作。', modeTopicTag:'系统学习',
    modeFree:'自由写作', modeFreeDesc:'输入任意主题，系统生成3个日语题目和提示。', modeFreeTag:'自由主题',
    modeDrill:'双向写作', modeDrillDesc:'每级300句，越南语↔日语由易到难翻译，并显示评分。', modeDrillTag:'反应训练',
    topicTitle:'选择主题', topicDesc:'每级100个主题，内部滚动更容易选择', topicSearch:'搜索主题：家族、仕事、AI...',
    freeTitle:'输入写作主题', freeDesc:'选择标签或输入自定义主题。题目为日语，下方显示灰色越南语翻译。', freePlaceholder:'例如：暑假、兴趣、喜欢的食物...', suggest:'生成题目 ✨', freeTags:'20个推荐标签:',
    currentTopic:'当前主题', vocab:'词汇', grammar:'语法', changeTopic:'← 更换主题', submit:'提交并获得反馈 ↗', clear:'清除', chars:'字符',
    libraryVocab:'按等级查看词汇', libraryGrammar:'按等级查看语法', libraryDesc:'选择等级和主题，然后点击项目查看详细说明。',
    searchLibrary:'搜索主题、词汇、语法...', sortDefault:'默认排序', sortAZ:'A → Z', sortZA:'Z → A',
    drillTitle:'300句翻译练习', drillDesc:'自动混合所选等级的主题，句子会逐渐变难。', check:'检查 ↗', previous:'← 上一句', skip:'跳过', next:'下一句 →', backMode:'⬅ 更换模式'
  }
};
const TOPIC_EN = {'家族':'Family','仕事':'Work','健康':'Health','環境':'Environment','教育':'Education','日本文化':'Japanese culture','社会経済':'Society & economy','科学と未来':'Science & future','人間関係':'Relationships','哲学と思考':'Philosophy & thinking','政治と社会':'Politics & society','文学と芸術':'Literature & art'};
const TOPIC_ZH = {'家族':'家庭','仕事':'工作','健康':'健康','環境':'环境','教育':'教育','日本文化':'日本文化','社会経済':'社会经济','科学と未来':'科学与未来','人間関係':'人际关系','哲学と思考':'哲学与思考','政治と社会':'政治与社会','文学と芸術':'文学与艺术'};
function ui(){ return UI_TEXT[state.uiLang || 'vi'] || UI_TEXT.vi; }
function localTopicName(t){
  const lang=state.uiLang||'vi';
  if(lang==='ja') return t.jpName || lvJPTopic(t.name);
  if(lang==='en') return TOPIC_EN[t.jpName] || TOPIC_EN[t.name] || t.name;
  if(lang==='zh') return TOPIC_ZH[t.jpName] || TOPIC_ZH[t.name] || t.name;
  return t.name;
}
function setText(sel, text){ const el=document.querySelector(sel); if(el) el.textContent=text; }
function setHTML(sel, html){ const el=document.querySelector(sel); if(el) el.innerHTML=html; }
function setPH(sel, text){ const el=document.querySelector(sel); if(el) el.placeholder=text; }
function applyUITranslations(){
  const T=ui();
  const nav=document.querySelectorAll('.nav-link');
  if(nav[0]) nav[0].textContent=T.navHome; if(nav[1]) nav[1].textContent=T.navPractice; if(nav[2]) nav[2].textContent=T.navVocab; if(nav[3]) nav[3].textContent=T.navGrammar;
  setText('.hero-badge', T.badge); setHTML('.hero-title', T.heroTitle); setText('.hero-sub', T.heroSub); setText('.hero-cta .btn-primary', T.cta);
  const stats=document.querySelectorAll('.hero-stats span:not(.dot-sep)');
  if(stats[0]) stats[0].innerHTML=`<strong>5</strong> ${T.statLevel}`; if(stats[1]) stats[1].innerHTML=`<strong>100</strong> ${T.statTopic}`; if(stats[2]) stats[2].innerHTML=`<strong>AI</strong> ${T.statAI}`;
  const stepHeaders=document.querySelectorAll('#step-level .step-title, #step-mode .step-title, #step-topics .step-title, #step-free-input .step-title');
  if(stepHeaders[0]) stepHeaders[0].textContent=T.stepLevel; if(stepHeaders[1]) stepHeaders[1].textContent=T.stepMode; if(stepHeaders[2]) stepHeaders[2].innerHTML=`${T.topicTitle} <span class="level-badge" id="topic-level-badge">${state.level||''}</span>`; if(stepHeaders[3]) stepHeaders[3].textContent=T.freeTitle;
  setText('#step-level .step-desc', T.stepLevelDesc); setText('#step-mode .step-desc', T.stepModeDesc); setText('#step-topics .step-desc', T.topicDesc); setText('#step-free-input .step-desc', T.freeDesc);
  const modeTitles=document.querySelectorAll('.mode-title'), modeDescs=document.querySelectorAll('.mode-desc'), modeTags=document.querySelectorAll('.mode-tag');
  if(modeTitles[0]) modeTitles[0].textContent=T.modeTopic; if(modeTitles[1]) modeTitles[1].textContent=T.modeFree; if(modeTitles[2]) modeTitles[2].textContent=T.modeDrill;
  if(modeDescs[0]) modeDescs[0].textContent=T.modeTopicDesc; if(modeDescs[1]) modeDescs[1].textContent=T.modeFreeDesc; if(modeDescs[2]) modeDescs[2].textContent=T.modeDrillDesc;
  if(modeTags[0]) modeTags[0].textContent=T.modeTopicTag; if(modeTags[1]) modeTags[1].textContent=T.modeFreeTag; if(modeTags[2]) modeTags[2].textContent=T.modeDrillTag;
  setPH('#topic-search', T.topicSearch); setPH('#free-topic-input', T.freePlaceholder); setText('.btn-suggest', T.suggest);
  setText('.sidebar-topic-label', T.currentTopic); const sh=document.querySelectorAll('.sidebar-block-header h4'); if(sh[0]) sh[0].textContent=`📖 ${T.vocab}`; if(sh[1]) sh[1].textContent=`🔧 ${T.grammar}`;
  setText('.btn-change-topic', T.changeTopic); const submit=document.querySelector('#step-writing .btn-submit'); if(submit) submit.textContent=T.submit; const clear=document.querySelector('#step-writing .btn-clear'); if(clear) clear.textContent=T.clear;
  setPH('#library-search', T.searchLibrary); const opts=document.querySelectorAll('#library-sort option'); if(opts[0]) opts[0].textContent=T.sortDefault; if(opts[1]) opts[1].textContent=T.sortAZ; if(opts[2]) opts[2].textContent=T.sortZA;
  setText('#library-title', libraryState?.type==='grammar'?T.libraryGrammar:T.libraryVocab); setText('#library-desc', T.libraryDesc);
  setPH('#drill-topic-search', T.topicSearch); setText('.drill-topic-panel h3', T.drillTitle); setText('.drill-topic-panel p', T.drillDesc); setText('#drill-check-btn', T.check);
  const drillBtns=document.querySelectorAll('.drill-nav button'); if(drillBtns[0]) drillBtns[0].textContent=T.previous; if(drillBtns[1]) drillBtns[1].textContent=T.skip; if(drillBtns[2]) drillBtns[2].textContent=T.next; if(drillBtns[3]) drillBtns[3].textContent=T.backMode;
  const footer=document.querySelector('.footer-copy'); if(footer) footer.textContent = state.uiLang==='ja'?'毎日、日本語作文を練習しましょう 🌸': state.uiLang==='en'?'Practice Japanese writing every day 🌸': state.uiLang==='zh'?'每天练习日语写作 🌸':'Luyện viết tiếng Nhật mỗi ngày 🌸';
  renderFreeTags();
  if(!document.getElementById('step-topics')?.classList.contains('step-hidden')) renderTopics();
  if(!document.getElementById('library-section')?.classList.contains('step-hidden')) { renderLibraryLevels(); renderLibraryTopics(); }
  if(state.topic && !document.getElementById('step-writing')?.classList.contains('step-hidden')) { renderSidebar(); renderPrompt(); }
  if(state.drill && !document.getElementById('step-drill')?.classList.contains('step-hidden')) renderDrill();
}
function setUILanguage(lang,btn){
  state.uiLang=lang;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b===btn || b.textContent.trim().toLowerCase().includes(lang)));
  applyUITranslations();
}

function vnPosFor(i){ return ['Danh từ / dùng trung tính trong văn viết','Động từ hoặc cụm biểu hiện / dùng trong câu giải thích hành động','Tính từ hoặc biểu hiện mô tả / dùng để bổ sung sắc thái'][i%3]; }
function vnCollocations(jp, vn){
  return [
    {jp:`${jp}について書く`, vi:`viết về ${vn}`},
    {jp:`${jp}を大切にする`, vi:`coi trọng ${vn}`},
    {jp:`${jp}に関係がある`, vi:`có liên quan đến ${vn}`}
  ];
}
function accurateVocabExamples(level,jp,vn,topic){
  const topicJP=lvJPTopic(topic), topicVN=topic;
  if(level==='N5') return [{jp:`私は${jp}について書きます。`, vi:`Tôi viết về ${vn}.`},{jp:`${jp}は大切です。`, vi:`${vn} rất quan trọng.`}];
  if(level==='N4') return [{jp:`${topicJP}について書くとき、${jp}という言葉を使います。`, vi:`Khi viết về ${topicVN}, tôi dùng từ “${vn}”.`},{jp:`私は${jp}に興味があります。`, vi:`Tôi quan tâm đến ${vn}.`}];
  if(level==='N3') return [{jp:`${topicJP}を考えるうえで、${jp}は重要なキーワードです。`, vi:`Khi suy nghĩ về ${topicVN}, “${vn}” là một từ khóa quan trọng.`},{jp:`${jp}を理解すると、自分の意見を具体的に書けます。`, vi:`Khi hiểu ${vn}, bạn có thể viết ý kiến của mình cụ thể hơn.`}];
  if(level==='N2') return [{jp:`${topicJP}を論じる際、${jp}という観点は欠かせません。`, vi:`Khi bàn luận về ${topicVN}, góc nhìn “${vn}” là không thể thiếu.`},{jp:`${jp}を用いることで、文章の説得力が高まります。`, vi:`Bằng cách sử dụng ${vn}, sức thuyết phục của bài viết sẽ tăng lên.`}];
  return [{jp:`${topicJP}の本質を問うなら、${jp}という概念を避けて通れません。`, vi:`Nếu bàn về bản chất của ${topicVN}, khó có thể tránh khái niệm “${vn}”.`},{jp:`${jp}は抽象的な議論を支える重要な語彙です。`, vi:`${vn} là từ vựng quan trọng nâng đỡ những lập luận mang tính trừu tượng.`}];
}
function lvBuildVocab(level,name,idx){
  const pool=LV_EXTRA_VOCAB[level] || LV_EXTRA_VOCAB.N3;
  const topicJP=lvJPTopic(name);
  const first=[topicJP, topicJP, `chủ đề “${name}”`];
  const chosen=[first,...pool.slice(idx%pool.length),...pool.slice(0,idx%pool.length)].slice(0,20);
  return chosen.map((x,i)=>{
    const jp=x[0], r=x[1], vn=x[2];
    return {jp,r,vn,_level:level,posVN:vnPosFor(i),
      nuanceVN:`Nên học theo cụm thay vì học riêng lẻ. Khi viết, hãy đặt “${jp}” vào phần chủ đề, lý do hoặc ví dụ để câu tự nhiên hơn.`,
      collocations:vnCollocations(jp,vn),
      collocation:vnCollocations(jp,vn).map(c=>`${c.jp} (${c.vi})`).join('・'),
      contextVN:`Dùng khi viết về “${name}” ở cấp ${level}. Từ này phù hợp để nêu chủ đề, bổ sung lý do hoặc làm ví dụ cụ thể trong bài viết.`,
      context:`Dùng khi viết về “${name}” ở cấp ${level}. Từ này phù hợp để nêu chủ đề, bổ sung lý do hoặc làm ví dụ cụ thể trong bài viết.`,
      examples:accurateVocabExamples(level,jp,vn,name),
      nuance:`Nên học theo cụm thay vì học riêng lẻ. Khi viết, hãy đặt “${jp}” vào phần chủ đề, lý do hoặc ví dụ để câu tự nhiên hơn.`};
  });
}
function grammarExamples(pattern,name){
  const jt=lvJPTopic(name), vn=name;
  const map={
    '〜は〜です':[{jp:`${jt}は大切なテーマです。`,vi:`${vn} là một chủ đề quan trọng.`},{jp:`私の趣味は読書です。`,vi:`Sở thích của tôi là đọc sách.`}],
    '〜が好きです':[{jp:`私は${jt}が好きです。`,vi:`Tôi thích ${vn}.`},{jp:`弟はサッカーが好きです。`,vi:`Em trai tôi thích bóng đá.`}],
    '〜に行きます':[{jp:`週末、公園に行きます。`,vi:`Cuối tuần tôi đi công viên.`},{jp:`友達と学校へ行きます。`,vi:`Tôi đi đến trường cùng bạn.`}],
    '〜を〜ます':[{jp:`毎日、日本語を勉強します。`,vi:`Mỗi ngày tôi học tiếng Nhật.`},{jp:`朝ごはんを食べます。`,vi:`Tôi ăn sáng.`}],
    '〜と〜':[{jp:`父と母は優しいです。`,vi:`Bố và mẹ tôi hiền.`},{jp:`パンとコーヒーを買いました。`,vi:`Tôi đã mua bánh mì và cà phê.`}],
    '〜があります':[{jp:`私の部屋には机があります。`,vi:`Trong phòng tôi có bàn học.`},{jp:`公園に大きな木があります。`,vi:`Ở công viên có một cái cây lớn.`}],
    '〜がいます':[{jp:`家に猫がいます。`,vi:`Ở nhà có một con mèo.`},{jp:`教室に先生がいます。`,vi:`Trong lớp có giáo viên.`}],
    '〜たことがあります':[{jp:`私は日本料理を食べたことがあります。`,vi:`Tôi đã từng ăn món Nhật.`},{jp:`京都へ行ったことがあります。`,vi:`Tôi đã từng đi Kyoto.`}],
    '〜ために':[{jp:`合格するために、毎日勉強しています。`,vi:`Để thi đỗ, tôi học mỗi ngày.`},{jp:`健康のために、早く寝ます。`,vi:`Vì sức khỏe, tôi đi ngủ sớm.`}],
    '〜ようになる':[{jp:`毎日練習して、日本語で日記が書けるようになりました。`,vi:`Nhờ luyện tập mỗi ngày, tôi đã có thể viết nhật ký bằng tiếng Nhật.`},{jp:`最近、早く起きるようになりました。`,vi:`Gần đây tôi bắt đầu dậy sớm hơn.`}],
    '〜と思います':[{jp:`${jt}は大切だと思います。`,vi:`Tôi nghĩ ${vn} là quan trọng.`},{jp:`この方法は便利だと思います。`,vi:`Tôi nghĩ phương pháp này tiện lợi.`}],
    '〜てみる':[{jp:`新しい勉強法を試してみます。`,vi:`Tôi sẽ thử phương pháp học mới.`},{jp:`日本料理を作ってみたいです。`,vi:`Tôi muốn thử nấu món Nhật.`}],
    '〜ほうがいい':[{jp:`毎日少しずつ練習したほうがいいです。`,vi:`Nên luyện tập từng chút mỗi ngày.`},{jp:`夜遅くまでスマホを見ないほうがいいです。`,vi:`Không nên xem điện thoại đến khuya.`}],
    '〜ながら':[{jp:`音楽を聞きながら、宿題をします。`,vi:`Tôi vừa nghe nhạc vừa làm bài tập.`},{jp:`景色を見ながら、散歩しました。`,vi:`Tôi vừa ngắm cảnh vừa đi dạo.`}],
    '〜によって':[{jp:`考え方は人によって違います。`,vi:`Cách suy nghĩ khác nhau tùy người.`},{jp:`技術の発展によって、生活は便利になりました。`,vi:`Nhờ sự phát triển công nghệ, cuộc sống đã trở nên tiện lợi.`}],
    '〜だけでなく〜も':[{jp:`SNSは便利なだけでなく、危険もあります。`,vi:`Mạng xã hội không chỉ tiện lợi mà còn có nguy cơ.`},{jp:`環境問題は国だけでなく、個人にも関係があります。`,vi:`Vấn đề môi trường không chỉ liên quan đến quốc gia mà còn liên quan đến từng cá nhân.`}],
    '〜べきだ':[{jp:`私たちは環境を守るべきです。`,vi:`Chúng ta nên bảo vệ môi trường.`},{jp:`若者は自分の意見を持つべきです。`,vi:`Người trẻ nên có chính kiến của mình.`}],
    '〜一方で':[{jp:`都会は便利な一方で、生活費が高いです。`,vi:`Thành phố tiện lợi, nhưng mặt khác chi phí sinh hoạt cao.`},{jp:`SNSは情報を得やすい一方で、時間を使いすぎることもあります。`,vi:`Mạng xã hội giúp dễ lấy thông tin, nhưng mặt khác cũng có thể khiến ta dùng quá nhiều thời gian.`}],
    '〜に対して':[{jp:`この問題に対して、政府は対策を取るべきです。`,vi:`Đối với vấn đề này, chính phủ nên đưa ra biện pháp.`},{jp:`日本文化に対して、強い興味があります。`,vi:`Tôi có sự quan tâm mạnh mẽ đối với văn hóa Nhật.`}],
    '〜ことによって':[{jp:`毎日書くことによって、表現力が上がります。`,vi:`Bằng việc viết mỗi ngày, khả năng diễn đạt sẽ tăng lên.`},{jp:`相手の話を聞くことによって、理解が深まります。`,vi:`Bằng việc lắng nghe đối phương, sự thấu hiểu sẽ sâu sắc hơn.`}],
    '〜わけではない':[{jp:`便利だからといって、問題がないわけではありません。`,vi:`Không phải cứ tiện lợi là không có vấn đề.`},{jp:`日本語が難しいわけではなく、練習が必要なのです。`,vi:`Không hẳn tiếng Nhật khó, mà là cần luyện tập.`}],
    '〜にもかかわらず':[{jp:`努力したにもかかわらず、結果は十分ではありませんでした。`,vi:`Mặc dù đã nỗ lực, kết quả vẫn chưa đủ tốt.`},{jp:`便利であるにもかかわらず、多くの課題が残っています。`,vi:`Mặc dù tiện lợi, vẫn còn nhiều vấn đề.`}],
    '〜を踏まえて':[{jp:`現状を踏まえて、解決策を考える必要があります。`,vi:`Cần suy nghĩ giải pháp dựa trên hiện trạng.`},{jp:`調査結果を踏まえて、意見を述べます。`,vi:`Tôi sẽ trình bày ý kiến dựa trên kết quả khảo sát.`}],
    '〜に伴って':[{jp:`高齢化に伴って、介護の需要が増えています。`,vi:`Cùng với già hóa dân số, nhu cầu chăm sóc người cao tuổi đang tăng.`},{jp:`技術の進歩に伴って、働き方も変化しています。`,vi:`Cùng với tiến bộ công nghệ, cách làm việc cũng đang thay đổi.`}],
    '〜ざるを得ない':[{jp:`人手が足りないため、外国人労働者に頼らざるを得ません。`,vi:`Vì thiếu nhân lực, không thể không dựa vào lao động nước ngoài.`},{jp:`状況が悪化すれば、計画を変更せざるを得ません。`,vi:`Nếu tình hình xấu đi, buộc phải thay đổi kế hoạch.`}],
    '〜をめぐって':[{jp:`教育改革をめぐって、さまざまな意見があります。`,vi:`Xung quanh cải cách giáo dục có nhiều ý kiến khác nhau.`},{jp:`環境政策をめぐって、議論が続いています。`,vi:`Các cuộc tranh luận vẫn tiếp diễn xoay quanh chính sách môi trường.`}],
    '〜に基づいて':[{jp:`データに基づいて、判断するべきです。`,vi:`Nên phán đoán dựa trên dữ liệu.`},{jp:`経験に基づいて、助言しました。`,vi:`Tôi đã đưa ra lời khuyên dựa trên kinh nghiệm.`}],
    '〜にすぎない':[{jp:`これは一つの例にすぎません。`,vi:`Đây chỉ là một ví dụ mà thôi.`},{jp:`技術は道具にすぎず、使い方が重要です。`,vi:`Công nghệ chỉ là công cụ, cách sử dụng mới quan trọng.`}],
    '〜がゆえに':[{jp:`自由であるがゆえに、責任も伴います。`,vi:`Chính vì có tự do nên cũng đi kèm trách nhiệm.`},{jp:`言葉は曖昧であるがゆえに、解釈の余地があります。`,vi:`Chính vì ngôn từ mơ hồ nên có chỗ cho việc diễn giải.`}],
    '〜にほかならない':[{jp:`教育は未来への投資にほかなりません。`,vi:`Giáo dục chính là sự đầu tư cho tương lai.`},{jp:`表現の自由は民主主義の基盤にほかなりません。`,vi:`Tự do biểu đạt chính là nền tảng của dân chủ.`}],
    '〜ならではの':[{jp:`日本ならではの美意識があります。`,vi:`Có một mỹ cảm đặc trưng chỉ Nhật Bản mới có.`},{jp:`文学ならではの力は、社会を映し出すことです。`,vi:`Sức mạnh riêng của văn học là phản ánh xã hội.`}],
    '〜とも〜とも言えない':[{jp:`この変化は良いとも悪いとも言えません。`,vi:`Không thể nói sự thay đổi này là tốt hay xấu.`},{jp:`AIは敵とも味方とも言えません。`,vi:`Không thể nói AI là kẻ thù hay đồng minh.`}],
    '〜に至っては':[{jp:`都市部に至っては、住宅費がさらに深刻です。`,vi:`Đến mức ở khu vực đô thị, chi phí nhà ở còn nghiêm trọng hơn.`},{jp:`若者に至っては、新聞をほとんど読まなくなりました。`,vi:`Đến cả giới trẻ cũng gần như không còn đọc báo giấy.`}],
    '〜ずにはおかない':[{jp:`この作品は読者に深い印象を与えずにはおきません。`,vi:`Tác phẩm này chắc chắn sẽ để lại ấn tượng sâu sắc cho độc giả.`},{jp:`技術革新は社会を変えずにはおきません。`,vi:`Đổi mới công nghệ nhất định sẽ làm thay đổi xã hội.`}],
    '〜いかんによらず':[{jp:`理由のいかんによらず、差別は許されません。`,vi:`Bất kể lý do là gì, phân biệt đối xử không được chấp nhận.`},{jp:`結果のいかんによらず、過程を評価するべきです。`,vi:`Bất kể kết quả thế nào, nên đánh giá cả quá trình.`}]
  };
  return map[pattern] || [{jp:`${jt}について考えることは大切です。`, vi:`Suy nghĩ về ${vn} là điều quan trọng.`},{jp:`この表現を使うと、文章が自然になります。`, vi:`Dùng cách diễn đạt này sẽ làm bài viết tự nhiên hơn.`}];
}
function lvBuildGrammar(level,name,idx){
  const pool=LV_GRAMMAR_POOL[level] || LV_GRAMMAR_POOL.N3;
  return pool.slice(0,7).map((g,i)=>({
    pattern:g[0], structure:g[1], meaning:g[2], meaningVN:g[2], context:g[3], _level:level,
    contextBullets:[`Dùng trong bài viết cấp ${level} khi muốn làm câu có logic rõ hơn.`, g[3], `Phù hợp với chủ đề “${name}” khi cần nêu lý do, ví dụ, mặt đối lập hoặc kết luận.`],
    examples:grammarExamples(g[0],name),
    note:`Mẫu này nên đặt ở câu giải thích hoặc câu kết nối ý. Tránh dùng quá nhiều lần trong cùng một đoạn; chỉ dùng khi quan hệ ý nghĩa thật sự phù hợp.`
  }));
}
function lvMakeTopic(level,name,idx){
  return {name, jpName:lvJPTopic(name), emoji:(typeof PATCH_EMOJIS !== 'undefined' ? PATCH_EMOJIS[idx%PATCH_EMOJIS.length] : ['🌸','📚','✏️','🎧','🎬','🍱','🏫','💼','🌍','🧠','📱','🚆','🏙️','🤝','🎯','☕','🏃','🛍️','🗾','✨'][idx%20]), category:lvCategoryForTopic(name), prompts:lvPromptSet(level,name), vocab:lvBuildVocab(level,name,idx), grammar:lvBuildGrammar(level,name,idx)};
}
lvEnsure100Topics();

function renderLevels(){
  const grid=document.getElementById('level-grid'); if(!grid) return;
  grid.innerHTML=LEVELS.map(l=>`<div class="level-card level-card-clean" id="lv-${l.id}" onclick="selectLevel('${l.id}')"><div class="level-jp" style="color:${l.color}">${l.name}</div><div class="level-sub">${escapeHTML(l.sub)}</div><div class="level-mini">100 chủ đề · 20 từ · 7 mẫu</div></div>`).join('');
}
function renderTopics(){
  const all=TOPICS[state.level]||[];
  const q=(document.getElementById('topic-search')?.value||'').toLowerCase().trim();
  const filter=document.getElementById('topic-filter')?.value||'all';
  const topics=all.map((t,i)=>({...t,_idx:i})).filter(t=>{
    const matchQ=!q || `${t.name} ${t.jpName}`.toLowerCase().includes(q);
    const matchF=filter==='all' || t.category===filter;
    return matchQ && matchF;
  });
  const badge=document.getElementById('topic-level-badge'); if(badge) badge.textContent=`${state.level} · ${topics.length}/${all.length}`;
  const grid=document.getElementById('topic-grid'); if(!grid) return;
  grid.innerHTML=topics.map(t=>`<div class="topic-card" onclick="selectTopic(${t._idx})"><div class="topic-emoji">${t.emoji}</div><div class="topic-name"><span class="topic-jp-name">${escapeHTML(t.jpName||'')}</span><span>${escapeHTML(localTopicName(t))}</span></div><div class="topic-count">3 đề · 20 từ · 7 mẫu</div></div>`).join('') || `<div class="empty-state">Không thấy chủ đề phù hợp. Thử từ khóa khác nhé.</div>`;
}
function promptVN(p){
  const jp=p.jp||'';
  const jt=state.topic?.jpName||'chủ đề này', vn=state.topic?.name||'chủ đề này';
  if(p.vn) return p.vn;
  if(jp.includes('短い文')) return `Hãy viết câu ngắn về ${vn}.`;
  if(jp.includes('好きなこと')) return `Hãy giới thiệu một điều bạn thích về ${vn}.`;
  if(jp.includes('いつ・どこで・だれと')) return `Hãy viết khi nào, ở đâu và với ai bạn làm điều liên quan đến ${vn}.`;
  if(jp.includes('経験')) return `Hãy viết về ${vn}, có đưa kinh nghiệm của bản thân.`;
  if(jp.includes('大切')) return `Hãy viết điều bạn cho là quan trọng về ${vn} và kèm lý do.`;
  if(jp.includes('これから')) return `Hãy viết cụ thể điều bạn muốn làm từ nay liên quan đến ${vn}.`;
  if(jp.includes('良い点')) return `Hãy viết ý kiến của bạn về điểm tốt và vấn đề của ${vn}.`;
  if(jp.includes('具体例')) return `Hãy nêu một ví dụ cụ thể và trình bày suy nghĩ về ${vn}.`;
  if(jp.includes('影響')) return `Hãy viết về ảnh hưởng của ${vn} đến đời sống/xã hội.`;
  if(jp.includes('現状')) return `Hãy bàn luận về hiện trạng và thách thức xoay quanh ${vn}.`;
  if(jp.includes('解決策')) return `Hãy nêu một vấn đề của ${vn} và đề xuất giải pháp.`;
  return `Bản dịch: Hãy viết về ${vn}.`;
}
function renderPrompt(){
  const p=state.topic.prompts[state.promptIdx%state.topic.prompts.length];
  const title=state.topic.jpName || lvJPTopic(state.topic.name);
  document.getElementById('writing-prompt').innerHTML=`<div class="prompt-head"><div><div class="prompt-label">テーマ：${escapeHTML(title)}</div><div class="prompt-index">課題 ${state.promptIdx+1}/${state.topic.prompts.length}</div></div><div class="prompt-switcher">${state.topic.prompts.map((_,i)=>`<button class="prompt-pill ${i===state.promptIdx?'active':''}" onclick="choosePrompt(${i})">${i+1}</button>`).join('')}</div></div><div class="prompt-text">${escapeHTML(p.jp)}</div><div class="prompt-vn-soft">${escapeHTML(promptVN(p))}</div>`;
}
function choosePrompt(i){ state.promptIdx=i; renderPrompt(); clearFeedback(); }

function renderSidebar(){
  const t=state.topic, T=ui();
  document.getElementById('sidebar-topic').textContent=`${t.emoji} ${t.jpName||lvJPTopic(t.name)}`;
  document.getElementById('sidebar-level').textContent=`${state.level} · ${localTopicName(t)}`;
  document.getElementById('vocab-list').innerHTML=t.vocab.map((v,idx)=>`<div class="vocab-item expandable-item" onclick="toggleLearningItem(this)"><div class="learning-row"><div><div class="vocab-jp">${escapeHTML(v.jp)}</div><div class="vocab-reading">${escapeHTML(v.r)}</div></div><div class="vocab-vn">${escapeHTML(v.vn)}</div></div><div class="expand-detail"><div><b>Collocation:</b> ${(v.collocations||[]).map(c=>`${escapeHTML(c.jp)} <span>(${escapeHTML(c.vi)})</span>`).join(' · ')}</div><div><b>Bối cảnh:</b> ${escapeHTML(v.contextVN||v.context||'')}</div><div class="mini-examples"><b>Ví dụ:</b><br>${(v.examples||[]).map((e,i)=>`${i+1}. ${escapeHTML(e.jp||e)} <span>(${escapeHTML(e.vi||'')})</span>`).join('<br>')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('vocab', state.topic.vocab[${idx}])">Mở chi tiết</button></div></div>`).join('');
  document.getElementById('vocab-count').textContent=t.vocab.length;
  document.getElementById('grammar-list').innerHTML=t.grammar.map((g,idx)=>`<div class="grammar-item expandable-item" onclick="toggleLearningItem(this)"><div class="grammar-pattern">${escapeHTML(g.pattern)}</div><div class="grammar-meaning">${escapeHTML(g.meaningVN||g.meaning)}</div><div class="expand-detail grammar-expand"><div><b>Cấu trúc:</b> ${escapeHTML(g.structure)}</div><div><b>Bối cảnh:</b> ${escapeHTML(g.contextBullets?.[1]||g.context)}</div><div class="mini-examples"><b>Ví dụ:</b><br>${(g.examples||[]).map((e,i)=>`${i+1}. ${escapeHTML(e.jp||e)} <span>(${escapeHTML(e.vi||'')})</span>`).join('<br>')}</div><button class="detail-button" onclick="event.stopPropagation(); lvOpenDetail('grammar', state.topic.grammar[${idx}])">Mở chi tiết</button></div></div>`).join('');
  document.getElementById('grammar-count').textContent=t.grammar.length;
  const sh=document.querySelectorAll('.sidebar-block-header h4'); if(sh[0]) sh[0].textContent=`📖 ${T.vocab}`; if(sh[1]) sh[1].textContent=`🔧 ${T.grammar}`;
}
function lvOpenDetail(type,item){
  const isV=type==='vocab';
  const level=item._level || state.level || libraryState?.level || 'JLPT';
  const html=isV?`
    <div class="modal-clean-head"><span>📖</span><div><small>Từ vựng · ${escapeHTML(level)}</small><h2 class="modal-title-jp">${escapeHTML(item.jp)}</h2><p class="modal-reading">${escapeHTML(item.r||'')}</p></div></div>
    <div class="modal-meaning">${escapeHTML(item.vn||'')}</div>
    <div class="modal-grid">
      <section><h4>Loại từ / sắc thái</h4><p>${escapeHTML(item.posVN||'Biểu hiện dùng trong văn viết hoặc hội thoại thường ngày.')}</p><p>${escapeHTML(item.nuanceVN||item.nuance||'')}</p></section>
      <section><h4>Bối cảnh sử dụng</h4><p>${escapeHTML(item.contextVN||item.context||'')}</p></section>
      <section class="wide"><h4>Collocation hay gặp</h4><div class="modal-chips">${(item.collocations||[]).map(c=>`<span>${escapeHTML(c.jp)} <em>(${escapeHTML(c.vi)})</em></span>`).join('')}</div></section>
      <section class="wide"><h4>Ví dụ thực tế</h4><ol class="modal-examples">${(item.examples||[]).map(e=>`<li><b>${escapeHTML(e.jp||e)}</b><small>${escapeHTML(e.vi||'')}</small></li>`).join('')}</ol></section>
    </div>`:`
    <div class="modal-clean-head"><span>🔧</span><div><small>Ngữ pháp · ${escapeHTML(level)}</small><h2 class="modal-title-jp">${escapeHTML(item.pattern)}</h2></div></div>
    <div class="modal-meaning">${escapeHTML(item.meaningVN||item.meaning||'')}</div>
    <div class="modal-grid">
      <section><h4>Cấu trúc</h4><p class="structure-line">${escapeHTML(item.structure||'')}</p></section>
      <section><h4>Bối cảnh dùng</h4><ul class="modal-bullets">${(item.contextBullets||[item.context]).map(b=>`<li>${escapeHTML(b)}</li>`).join('')}</ul></section>
      <section class="wide"><h4>Ý nghĩa chi tiết</h4><p>${escapeHTML(item.note||item.meaningVN||item.meaning||'')}</p></section>
      <section class="wide"><h4>Ví dụ</h4><ol class="modal-examples">${(item.examples||[]).map(e=>`<li><b>${escapeHTML(e.jp||e)}</b><small>${escapeHTML(e.vi||'')}</small></li>`).join('')}</ol></section>
    </div>`;
  const modal=document.getElementById('learning-modal'), content=document.getElementById('learning-modal-content');
  if(content) content.innerHTML=html;
  modal?.classList.remove('step-hidden');
}

function renderFreeTags(){
  const wrap=document.querySelector('.free-examples'); if(!wrap) return;
  wrap.innerHTML=`<span class="free-ex-label">${escapeHTML(ui().freeTags)}</span>`+FREE_TOPIC_TAGS_20.map(tag=>`<button class="quick-chip" onclick="setFreeTopic('${tag.replace(/'/g,"\\'")}')">${escapeHTML(tag)}</button>`).join('');
}
function getSuggestions(){
  const input=document.getElementById('free-topic-input').value.trim();
  if(!input) return document.getElementById('free-topic-input').focus();
  state.freeTopic=input;
  state.topic=lvMakeTopic(state.level,input,FREE_TOPIC_TAGS_20.indexOf(input)+11);
  state.topic.emoji='✏️';
  state.promptIdx=0; renderSidebar(); renderPrompt(); showStep('step-writing'); scrollToStep('step-writing'); clearFeedback(); applyUITranslations();
}
function selectMode(mode){
  state.mode=mode;
  document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('mode-'+mode)?.classList.add('active');
  if(mode==='topic'){ renderTopics(); showStep('step-topics'); scrollToStep('step-topics'); }
  else if(mode==='free'){ showStep('step-free-input'); scrollToStep('step-free-input'); renderFreeTags(); }
  else if(mode==='drill'){ initDrill(); showStep('step-drill'); scrollToStep('step-drill'); }
}
function showStep(id){
  const steps=['step-mode','step-topics','step-free-input','step-drill','step-writing'];
  steps.forEach(s=>document.getElementById(s)?.classList.add('step-hidden'));
  document.getElementById(id)?.classList.remove('step-hidden');
}
function backToMode(){ showStep('step-mode'); scrollToStep('step-mode'); }
function backToTopics(){
  if(state.mode==='free') { showStep('step-free-input'); scrollToStep('step-free-input'); }
  else if(state.mode==='drill') { showStep('step-drill'); scrollToStep('step-drill'); }
  else { showStep('step-topics'); scrollToStep('step-topics'); }
  document.getElementById('next-actions').style.display='none';
}
function renderLibraryLevels(){
  const wrap=document.getElementById('library-levels'); if(!wrap) return;
  wrap.innerHTML=LEVELS.map(l=>`<button class="library-level ${libraryState.level===l.id?'active':''}" onclick="libraryState.level='${l.id}'; libraryState.topicIdx=null; renderLibraryLevels(); renderLibraryTopics();">${l.name}<span>${escapeHTML(l.sub)}</span></button>`).join('');
  document.getElementById('library-tab-vocab')?.classList.toggle('active',libraryState.type==='vocab');
  document.getElementById('library-tab-grammar')?.classList.toggle('active',libraryState.type==='grammar');
  setText('#library-title', libraryState.type==='vocab'?ui().libraryVocab:ui().libraryGrammar); setText('#library-desc', ui().libraryDesc);
}
function renderLibraryTopics(){
  const q=(document.getElementById('library-search')?.value||'').toLowerCase().trim();
  const sort=document.getElementById('library-sort')?.value||'default';
  let topics=(TOPICS[libraryState.level]||[]).map((t,i)=>({...t,_idx:i})).filter(t=>!q || `${t.name} ${t.jpName} ${t.vocab.map(v=>v.jp+v.vn).join(' ')} ${t.grammar.map(g=>g.pattern+g.meaning).join(' ')}`.toLowerCase().includes(q));
  if(sort==='az') topics.sort((a,b)=>localTopicName(a).localeCompare(localTopicName(b))); if(sort==='za') topics.sort((a,b)=>localTopicName(b).localeCompare(localTopicName(a)));
  const grid=document.getElementById('library-topic-grid'); if(!grid) return;
  grid.innerHTML=topics.map(t=>`<button class="library-topic ${libraryState.topicIdx===t._idx?'active':''}" onclick="libraryState.topicIdx=${t._idx}; renderLibraryTopics(); renderLibraryItems();"><span>${t.emoji}</span><b>${escapeHTML(t.jpName)}</b><small>${escapeHTML(localTopicName(t))}</small></button>`).join('');
  if(libraryState.topicIdx==null && topics[0]) libraryState.topicIdx=topics[0]._idx;
  renderLibraryItems();
}
function renderLibraryItems(){
  const box=document.getElementById('library-items'); if(!box) return;
  const topic=(TOPICS[libraryState.level]||[])[libraryState.topicIdx];
  if(!topic){ box.innerHTML='<div class="empty-state">Chọn một chủ đề để xem nội dung.</div>'; return; }
  const items=libraryState.type==='vocab'?topic.vocab:topic.grammar;
  box.innerHTML=`<div class="library-items-head"><div><h3>${topic.emoji} ${escapeHTML(topic.jpName)}</h3><p>${escapeHTML(localTopicName(topic))} · ${libraryState.level} · ${items.length} mục</p></div></div><div class="library-card-grid">${items.map((it,i)=>libraryState.type==='vocab'?`<button class="library-item-card" onclick="lvOpenDetail('vocab', TOPICS['${libraryState.level}'][${libraryState.topicIdx}].vocab[${i}])"><b>${escapeHTML(it.jp)}</b><span>${escapeHTML(it.r)}</span><small>${escapeHTML(it.vn)}</small></button>`:`<button class="library-item-card grammar" onclick="lvOpenDetail('grammar', TOPICS['${libraryState.level}'][${libraryState.topicIdx}].grammar[${i}])"><b>${escapeHTML(it.pattern)}</b><small>${escapeHTML(it.meaningVN||it.meaning)}</small></button>`).join('')}</div>`;
}

function buildDrillItems(level){
  const topics=TOPICS[level]||[];
  const arr=[];
  for(let i=0;i<300;i++){
    const topic=topics[i%topics.length];
    const base=buildDrillSentence(level, topic, i);
    const stage = i<80?'easy': i<190?'medium':'hard';
    base.stage=stage; base.topic=topic; base.no=i+1;
    if(stage==='medium' && base.direction==='vn-jp') base.source += ' Hãy viết tự nhiên hơn bằng một lý do ngắn.';
    if(stage==='hard' && base.direction==='vn-jp') base.source += ' Hãy dùng cấu trúc gợi ý và viết câu có sắc thái văn viết.';
    arr.push(base);
  }
  return arr;
}
function initDrill(){
  state.drill={idx:0,correct:0,answered:0,totalScore:0,unlockedNext:false,items:buildDrillItems(state.level)};
  renderDrill();
}
function renderDrill(){
  const d=state.drill; if(!d) return;
  const item=d.items[d.idx], T=ui();
  const avg=d.answered?Math.round(d.totalScore/d.answered):0;
  document.getElementById('drill-level-badge').textContent=`${state.level} · ${T.drillTitle}`;
  document.getElementById('drill-progress-text').textContent=`${item.no}/300 · ${item.stage==='easy'?'Dễ':item.stage==='medium'?'Trung bình':'Khó'}`;
  document.getElementById('drill-streak').textContent=d.answered?`Điểm TB ${avg}`:'Điểm TB 0';
  document.getElementById('drill-progress-fill').style.width=`${((d.idx+1)/300)*100}%`;
  document.getElementById('drill-direction').textContent=item.direction==='vn-jp'?'🇻🇳 → 🇯🇵 Dịch sang tiếng Nhật':'🇯🇵 → 🇻🇳 Dịch sang tiếng Việt';
  document.getElementById('drill-sentence').innerHTML=`<span class="drill-topic-badge">${escapeHTML(item.topic.jpName)} · ${escapeHTML(localTopicName(item.topic))}</span>${escapeHTML(item.source)}`;
  document.getElementById('drill-vocab-hint').textContent=item.hint;
  const ans=document.getElementById('drill-answer'); if(ans) ans.value=''; document.getElementById('drill-char-count').textContent='0 '+T.chars;
  document.getElementById('drill-feedback').innerHTML=''; document.getElementById('drill-next-btn').style.display='none'; d.unlockedNext=false;
  applyUITranslationsShallow();
}
function applyUITranslationsShallow(){ const T=ui(); setText('#drill-check-btn',T.check); const b=document.querySelectorAll('.drill-nav button'); if(b[0])b[0].textContent=T.previous; if(b[1])b[1].textContent=T.skip; if(b[2])b[2].textContent=T.next; if(b[3])b[3].textContent=T.backMode; }
function normalizeAnswer(s){ return String(s||'').toLowerCase().replace(/[。、．，,！？!?\s]/g,'').trim(); }
function scoreDrill(user, model, direction){
  const u=normalizeAnswer(user), m=normalizeAnswer(model);
  if(!u) return 0;
  if(u===m) return 100;
  if(direction==='jp-vn'){
    const words=String(model).toLowerCase().split(/\s+/).filter(w=>w.length>2);
    const hit=words.filter(w=>String(user).toLowerCase().includes(w)).length;
    return Math.min(95, Math.round((hit/Math.max(words.length,1))*100));
  }
  let common=0; [...new Set(m.split(''))].forEach(ch=>{ if(u.includes(ch)) common++; });
  return Math.min(92, Math.round((common/Math.max(new Set(m.split('')).size,1))*100));
}
function submitDrill(){
  const d=state.drill, item=d.items[d.idx];
  const answer=document.getElementById('drill-answer').value.trim();
  if(!answer) return document.getElementById('drill-answer').focus();
  const score=scoreDrill(answer,item.answer,item.direction);
  d.answered++; d.totalScore+=score; if(score>=80) d.correct++; d.unlockedNext=true;
  const status=score>=90?'Rất tốt':score>=75?'Đạt':score>=50?'Gần đúng':'Cần sửa';
  const cls=score>=80?'drill-good':score>=50?'drill-mid':'drill-low';
  document.getElementById('drill-feedback').innerHTML=`<div class="drill-score-card ${cls}"><div class="drill-score-main"><div class="drill-score-circle">${score}</div><div><b>${status}</b><p>${score>=80?'Bạn có thể qua câu tiếp theo.':'Hãy so sánh với câu mẫu rồi thử lại hoặc bấm bỏ qua.'}</p></div></div><div class="drill-answer-model"><small>Câu mẫu</small><strong>${escapeHTML(item.answer)}</strong></div></div>`;
  document.getElementById('drill-next-btn').style.display='inline-block';
  document.getElementById('drill-streak').textContent=`Điểm TB ${Math.round(d.totalScore/d.answered)} · Đúng ${d.correct}/${d.answered}`;
}
function nextDrill(){ const d=state.drill; if(!d) return; d.idx=Math.min(d.idx+1,d.items.length-1); renderDrill(); }
function prevDrill(){ const d=state.drill; if(!d) return; d.idx=Math.max(d.idx-1,0); renderDrill(); }
function skipDrill(){ nextDrill(); }
function clearDrill(){ const ans=document.getElementById('drill-answer'); if(ans) ans.value=''; document.getElementById('drill-char-count').textContent='0 '+ui().chars; document.getElementById('drill-feedback').innerHTML=''; }

document.addEventListener('DOMContentLoaded',()=>{
  renderLevels(); renderFreeTags();
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b.textContent.trim()==='VI'));
  applyUITranslations();
  const da=document.getElementById('drill-answer');
  if(da) da.addEventListener('input',()=>{ document.getElementById('drill-char-count').textContent=da.value.length+' '+ui().chars; });
});

// PATCH 2026-05-D2 — language-safe nav active state
function setActiveNav(kind){
  const order={home:0,practice:1,vocab:2,grammar:3};
  document.querySelectorAll('.nav-link').forEach((a,i)=>a.classList.toggle('active', i===order[kind]));
}
