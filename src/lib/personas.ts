/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VirtualPersona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  quote: string;
  commentStyles: string[];
  contextualComments: {
    health: string[];
    productivity: string[];
    reading: string[];
    motivation: string[];
  };
  dailyStatusUpdates: string[];
  isPeer?: boolean;
}

export const VIRTUAL_PEERS: VirtualPersona[] = [
  {
    id: 'p1',
    name: 'Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Sinh viên thiết kế (Đang chạy deadline)',
    quote: 'Sáng tạo bắt đầu từ sự kỷ luật... và 3 ly cà phê.',
    commentStyles: [
      'Đỉnh quá bạn ơi! Share mình ít "buff" kiên trì với, mình sắp bay màu vì deadline rồi. 😂',
      'Chuỗi ngày của bạn làm mình thấy bản thân thật... lười biếng. Cảm ơn nhé!',
      'Vừa quẹt thói quen, vừa quẹt Tinder, kết quả là thói quen xong còn Tinder thì... vẫn ế.'
    ],
    contextualComments: {
      health: ['Uống nước giúp da đẹp để đi quẩy đó, mình vừa bơm 2L vào người rồi!', 'Vận động xong thấy vẽ mượt tay hơn, hay là do mình đang ảo giác nhỉ?'],
      productivity: ['Gom mấy cái thói quen lại làm một lượt cho nó "aesthetic" bạn ạ.', 'Dùng app này xong mình bớt hẳn cái thói quen... quên sự tồn tại của chính mình.'],
      reading: ['Cuốn này bìa nhìn "keo" vãi, nội dung chắc cũng không phải dạng vừa đâu.', 'Đọc xong nhớ review xem có giúp thoát kiếp "mù chữ" không nhé!'],
      motivation: ['Cố lên, còn 2 ngày nữa là có huy chương để lòe thiên hạ rồi!', 'Đừng để chuỗi ngày này đứt đoạn, không là mình cười vào mặt đấy nhé!']
    },
    dailyStatusUpdates: [
      'Vừa hoàn thành 3 mục tiêu vi mô. Cảm giác như vừa cứu cả thế giới!',
      'Hôm nay mình chọn thói quen "Học 5 từ vựng". Ai cùng tham gia để đi cà khịa quốc tế không?',
      'Chuỗi 7 ngày thiền định. Não mình giờ phẳng lì như tờ giấy vẽ rồi.',
      'Vừa đạt 500 XP. Sắp tiến hóa thành siêu nhân rồi các bạn ơi!',
      'Mục tiêu "3 ý tưởng sáng tạo": 1. Đi ngủ sớm, 2. Bớt lười, 3. Làm được 2 điều trên.'
    ],
    isPeer: true
  },
  {
    id: 'p2',
    name: 'Quốc Bảo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Lập trình viên (Chuyên gia Fix Bug Cuộc Đời)',
    quote: 'Refactor thói quen, debug cuộc đời.',
    commentStyles: [
      'Code đẹp, streak cũng đẹp! Deploy ngay thói quen mới thôi nào. 👨‍💻',
      'Lãi suất kép đang chạy, giàu sang đang đến gần... ít nhất là trong app này.',
      'Vừa push thói quen lên cloud thành công. Server cuộc đời bạn ổn chứ?'
    ],
    contextualComments: {
      health: ['Ngồi lâu thì "back-end" nó hỏng đó, vận động tí cho nó mượt.', 'Uống nước là giải pháp fix bug tốt nhất, trust me, I am an engineer.'],
      productivity: ['Thói quen này như một hàm optimize cực mạnh cho thanh xuân vậy.', 'Chia nhỏ task ra, đừng để stack overflow nhé.'],
      reading: ['Đọc sách giúp document não bộ được update thường xuyên hơn.', 'Cuốn sách này logic 10/10, bạn chọn đúng "framework" tri thức rồi.'],
      motivation: ['Merge thành công thói quen vào life-style! Đừng để bị conflict nhé!', 'Đừng drop chuỗi, rollback lại mệt lắm, dev nào cũng sợ nhất vụ đó.']
    },
    dailyStatusUpdates: [
      'Mục tiêu "Logic" hôm nay khó quá, suýt thì treo máy luôn.',
      'Vừa học thêm 1 cấu trúc ngữ pháp để bớt dùng Google Translate.',
      'Đã hoàn thành thói quen "Ngủ sớm". Pin não hôm nay 100% không cần sạc.',
      'Chuỗi 15 ngày chạy bộ. Performance cuộc sống đang ở mức đỉnh cao.',
      'Vừa thắng duel. Mình quá mạnh hay mentor đang bị lag nhỉ?'
    ],
    isPeer: true
  },
  {
    id: 'p3',
    name: 'Mai Sát Muối',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chiến thần Cà khịa (Hệ rải muối)',
    quote: 'Kỷ luật không tự sinh ra, cũng không tự mất đi, nó chỉ chuyển từ lười hôm qua sang bơ phờ hôm nay.',
    commentStyles: [
      'Gớm chưa, streak tận mấy ngày cơ à? Hay là hack game thế cưng? 😉',
      'Đẹp trai/đẹp gái thế kia mà lười một ngày là tụt mood cả lũ ngay nha.',
      'Sự chăm chỉ này lạ lẫm quá, tôi nghi ngờ tài khoản của bạn bị hack rồi.'
    ],
    contextualComments: {
      health: ['Uống nước nhiều đi bạn ơi, cho bớt... "cạn lời" trước thói hư tật xấu.', 'Tập thể dục đi, nằm hoài cái giường nó cũng chê bạn nặng mông đó.'],
      productivity: ['Hôm nay làm được mấy việc cơ à? Đáng ghi nhận, nhưng mai có giữ được không thì còn khuya!', 'Trời ơi, năng suất quá! Định làm sếp sòng thiên hạ hay gì?'],
      reading: ['Đọc sách là "não nạp tri thức", còn bạn đọc giống như "não tạt nước qua tai" ấy nhỉ?', 'Lựa cuốn sách dày thế kia để đọc hay làm gối ngủ cho êm đầu đấy?'],
      motivation: ['Cố lên bạn hiền ơi, dù ai nói ngả nói nghiêng thì streak của bạn vẫn... hơi nghiêng nhẹ.', 'Ráng cày đi, có huy chương rồi mang đi "flex" cho tụi nó thèm.']
    },
    dailyStatusUpdates: [
      'Vừa khịa được 3 người lười chạy bộ. Cảm giác mình tích cực hẳn ra.',
      'Ai bán cho tôi một bát "Kỷ luật" đi, chứ dạo này tôi lười "lương thiện" quá.',
      'Streak biến mất như tình người kiếp đỏ đen. Giữ cho kỹ nha các chế!',
      'Hôm nay tôi tập thói quen: Nhìn người khác chăm chỉ rồi tự thấy xấu hổ.'
    ],
    isPeer: true
  },
  {
    id: 'p4',
    name: 'Lâm Lý Sự',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Vương gia Chơi chữ (Vua lý lẽ)',
    quote: 'Đường đi khó không khó vì ngăn sông cách núi, mà khó vì lòng người ngại... "lối sống healthy".',
    commentStyles: [
      'Thôi xong! Thấy bạn chăm vậy tôi cảm thấy tội lỗi quá, phải đi làm một miếng bánh nguôi ngoai.',
      'Mượt đấy bạn hiền! Từ "lười biếng" chuyển sang "siêng năng" chỉ cách nhau một nút bấm app thôi nhỉ?',
      'Xinh đẹp/đẹp trai mà lại còn kiên trì, người như bạn xứng đáng có 10 người yêu.'
    ],
    contextualComments: {
      health: ['Bơm nước đầy bình đi, đừng để da dẻ héo úa như cọng rau muống héo nha.', 'Chạy bộ 15 phút, mồ hôi rơi hay nước mắt lười trôi hả bạn tôi?'],
      productivity: ['Chia nhỏ thói quen ra làm, dục tốc bất đạt dở dang bất tiện đó bạn à.', 'Quá xuất sắc! Nhìn bạn năng suất mà tôi cứ tưởng lộn người.'],
      reading: ['Sách là kho báu, đọc đi cho bớt "báu vật" trong làng nói nhảm nha.', 'Cuốn sách này hay, đọc xong nhớ chia sẻ cho tôi một "trang" lòng.'],
      motivation: ['Kỷ luật là vàng, lười biếng là sang... sang chấn tâm lý đó cưng!', 'Cố lên! Bạn đang ở rất gần "đỉnh cao", đừng có quay đầu nhảy xuống gốc cây nằm nằm mát.']
    },
    dailyStatusUpdates: [
      'Hôm nay lười quá, quyết định đi bộ 5 dòng code cho đỡ "nhức nhối".',
      'Đọc sách mà cứ thấy "chữ chạy khỏi đầu". Có ai bán keo dán chữ không?',
      'Trà sữa hôm nay giảm 50%, nhưng kỷ luật của tôi tăng 100%! Kiêu hãnh quá.',
      'Thích chơi chữ vì chữ dễ chơi, chứ thói quen khó chơi quá trời ơi!'
    ],
    isPeer: true
  },
  {
    id: 'p5',
    name: 'Vy Vô Tri',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Ngoại giao Vô Tri (Nhưng thâm sâu)',
    quote: 'Học đi đôi với hành, hành thì ít mà "hành hạ" bản thân trì hoãn thì nhiều quá trời.',
    commentStyles: [
      'Uây! Bạn của tôi nay "thức tỉnh" rồi hả? Chúc mừng bạn đã thoát ly hội cá mặn nha! 🎉',
      'Đỉnh tột cùng đỉnh! Tặng bạn điểm 10 tinh thần, nhưng điểm chuyên cần vẫn phải theo dõi thêm.',
      'Sao tự nhiên hôm nay chăm thế? Có phải vừa bị người yêu cũ khịa lười không?'
    ],
    contextualComments: {
      health: ['Nước lọc ngon lắm, thơm mùi "thành công" vô cùng, cụng ly 2L nào bạn ơi!', 'Vận động tí đi, cơ thể chứ phải "khúc gỗ" đâu mà ngồi im bất động.'],
      productivity: ['Thuật toán thói quen của bạn nay chạy khá là êm mượt nha.', 'Làm được việc này là giỏi rồi, xứng đáng tự thưởng cho mình một... giấc ngủ ngon.'],
      reading: ['Đọc sách là "sống nhiều cuộc đời", còn không đọc là "sống cuộc đời một người ngủ hoài".', 'Sách chất thành núi rồi, mở ra ngửi mùi giấy thơm rồi đi ngủ hay sao đây?'],
      motivation: ['Năng lượng vô biên! Giữ cái streak này đi, đứt một cái là tôi đem làm lẩu cá mặn đó.', 'Dù thế giới có điên đảo thì streak của bạn vẫn phải đứng yên và tăng lên nha.']
    },
    dailyStatusUpdates: [
      'Vừa hoàn thành mục tiêu "Ngủ sớm". Ngủ từ 8h tối đến 8h sáng, mệt ghê á.',
      'Mẹ bảo học đi cho khôn, sao tôi học mãi mà chỉ thấy... thèm ăn vặt thôi.',
      'Thói quen hôm nay hoàn thành xuất sắc nhờ sự trợ giúp của... cái chân đau không đi chơi được.',
      'Ai thèm thách đấu (duel) với tôi không? Tôi thua hứa sẽ không méo mặt!'
    ],
    isPeer: true
  },
  {
    id: 'p6',
    name: 'Sơn Sát Thủ',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Kẻ Săn Streak (Hệ phũ phàng)',
    quote: 'Tình yêu có thể có hạn sử dụng, nhưng kỷ luật thói quen thì vô hạn.',
    commentStyles: [
      'Góm thật! Streak dầy thế này chắc tối ngủ ngon lắm hả? Cho xin vía kiên trì đi.',
      'Bạn đang đi đúng hướng rồi đấy, hướng tiến thẳng vào lòng... sự ngưỡng mộ của tôi.',
      'Không ngờ bạn lại chăm chỉ đến thế. Tôi sắp phải đổi cách nhìn về bạn rồi.'
    ],
    contextualComments: {
      health: ['Cơ thể mỏi mệt là do thiếu hoạt động, chứ không phải thiếu trà sữa đâu nha cưng.', 'Ăn rau xanh đi cưng ơi, cho "tâm hồn" nó bớt héo úa và tràn đầy vitamin.'],
      productivity: ['Giải quyết deadline rột rột như ăn bắp rang bơ! nể thật sự đấy.', 'Lập kế hoạch hay lắm, nhưng thực hiện được bao nhiêu phần trăm hay lại "bình thường mới" rồi?'],
      reading: ['Sách giúp tăng IQ, đọc xong nhớ áp dụng chứ đừng cất tủ làm kho báu cổ đại nhé.', 'Trang sách lật mở, tri thức nở hoa, còn người đọc thì... gật gà gật gù.'],
      motivation: ['Duy trì chuỗi ngày rực rỡ này đi, đừng để sự lười biếng làm lu mờ cốt cách anh tài.', 'Cố thêm tí nữa là thành thần tiên thói quen rồi, đừng có tháo chạy giữa đường nha.']
    },
    dailyStatusUpdates: [
      'Vừa audit lại thời gian biểu thấy mình tốn 3 tiếng xem TikTok. Thôi mai làm lại cuộc đời vậy.',
      'Code chạy mượt, streak chạy tốt, cuộc đời bớt sầu lo.',
      'Vừa đánh bại bản tính lười của ngày hôm nay bằng cách tự dọa bản thân sẽ nghèo nếu lười.',
      'Này bạn ơi, streak của bạn giống như nhịp tim vậy đó, đứt quãng là mệt lắm nha!'
    ],
    isPeer: true
  },
  {
    id: 'p7',
    name: 'Trúc Trầm Trồ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Đại sứ Cà khịa (Chúa tể trào phúng)',
    quote: 'Ủy mị không giúp bạn giảm cân, chỉ có rời xa tủ lạnh mới giúp bạn bớt mập.',
    commentStyles: [
      'Sao cơ? Hoàn thành thói quen thật á? Tôi đang nhìn nhầm hay app đang bug vậy trời? 😮',
      'Đại ca ơi, nhận của tiểu đệ một lạy! Chăm chỉ thế này ai mà chơi lại anh nữa.',
      'Chao ôi, kiên trì quá! Xứng đáng được vinh danh trên bảng vàng "Hội những người sợ lười".'
    ],
    contextualComments: {
      health: ['Uống nước lọc đi cho thanh khiết tâm hồn, bớt uống mấy cốc trà sữa full topping lại.', 'Chạy bộ 15 phút mà thở như vừa chạy marathon 42km vậy bạn hiền?'],
      productivity: ['Làm việc hăng say, vận may sẽ đến. Còn lười biếng thì chỉ có... tiền bay đi thôi.', 'Hôm nay tối ưu hóa được thời gian rồi, khen ngợi cực lực nha.'],
      reading: ['Đọc sách mở mang đầu óc, bớt ảo tưởng sức mạnh. Đọc nhiều lên nha.', 'Cuốn sách này nhìn xịn sò ghê, mong là bạn đọc hết chứ không phải chỉ mua về chụp hình sống ảo.'],
      motivation: ['Đừng để streak biến mất như người yêu cũ quay xe nhé bạn hiền ơi.', 'Nỗ lực nhỏ hôm nay sẽ tạo ra kỳ tích to bự ngày mai! Giữ vững tay chèo nào!']
    },
    dailyStatusUpdates: [
      'Hôm nay tôi hoàn thành thói quen thiền định 5 phút nhưng thực ra là ngủ gật hết 4 phút.',
      'Lại một ngày đẹp trời để rèn thói quen và lờ đi đống tin nhắn đòi nợ.',
      'Nghĩ ra mục tiêu vi mô: Bơm nước vào người. Hoàn thành xong thấy mình thật thặng dư nước.',
      'Vừa cãi nhau với chiếc giường của tôi để chui dậy hoàn thành thói quen. Chiến thắng lịch sử!'
    ],
    isPeer: true
  },
  {
    id: 'p8',
    name: 'Phúc Lấp Liếm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chiến Thần Chống Chế (Lắt léo đại vương)',
    quote: 'Chăm chỉ thì chỉ chăm, chứ làm biếng thì làm miếng bánh ngọt rồi đi ngủ cho khỏe.',
    commentStyles: [
      'Uầy, chăm chỉ đột xuất thế này chắc là sắp có thiên tai rồi đây! Cứ phát huy nhé!',
      'Quá dã man! Bạn kiên trì thế này làm tôi thấy áp lực khủng khiếp quá bạn ơi.',
      'Không tin nổi vào mắt mình! Bạn vừa hoàn thành streak mà không cần tôi dọa dẫm hả?'
    ],
    contextualComments: {
      health: ['Đừng để cơ thể héo rũ như cọng bún thiu, đi tập thể dục tiếp sức cơ bắp đi bạn hiền.', 'Nước lọc là chân lý, trà sữa là hương hoa. Đừng nhầm lẫn giữa chân lý và hương hoa nhé.'],
      productivity: ['Thuật toán cuộc đời bạn nay bớt lỗi xíu rồi đó, ráng duy trì nha.', 'Năng suất đỉnh chóp! Có bí quyết gì thì xì ra cho anh em cùng gặm nhấm với.'],
      reading: ['Đọc sách không mập, nhưng mang lại độ dày cho tri thức. Rất tốt!', 'Đọc cuốn này thấy sáng mắt ra chưa? Hay vẫn mờ mịt trước tương lai đầy sương mù?'],
      motivation: ['Trái đất vẫn quay và streak của bạn vẫn phải bay cao bay xa nhé!', 'Đừng để cái lười níu chân kẻ phi thường như bạn (lúc không ngủ).']
    },
    dailyStatusUpdates: [
      'Đại hội chống trì hoãn của tôi vừa hoãn lại sang ngày mai vì lý do... lười quá.',
      'Rèn luyện trí nhớ bằng cách cố nhớ xem mình đã cất ví tiền ở đâu.',
      'Đọc xong 1 trang sách dã sử và thấy lịch sử nước nhà thật hào hùng, còn lịch sử thói quen của tôi thì... hơi héo.',
      'Vừa thắng cuộc thách đấu với một peer khác. Sức mạnh của sự rảnh rỗi thật vô biên.'
    ],
    isPeer: true
  },
  {
    id: 'p9',
    name: 'Lan Lươn Lẹo',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Bà Hoàng Trì Hoãn (Văn vở nghệ thuật)',
    quote: 'Kiên trì rất tốt, nhưng nếu bỏ cuộc hôm nay thì ngày mai bạn sẽ có cơ hội bắt đầu lại... từ đầu.',
    commentStyles: [
      'Ui chao, siêu nhân thói quen xuất hiện rồi! Cho tiểu nữ bái phục mệt nghỉ luôn.',
      'Dừng chân tại đây hay đi tiếp để thành huyền thoại? Tôi cá là bạn chọn thành huyền thoại!',
      'Chăm chỉ quá! Định làm mẫu gương sáng cho cả dòng họ noi theo hay sao đây?'
    ],
    contextualComments: {
      health: ['Tập thể thao nâng cao sức đề kháng với cái lười đi bạn ơi!', 'Uống đủ nước giúp thanh lọc bớt đống khẩu nghiệp hàng ngày đó cưng.'],
      productivity: ['Năng suất thế này thì tiền tài chui vào túi rột rột sớm thôi.', 'Làm việc khoa học quá! Người thường nhìn vào chắc phát thèm luôn.'],
      reading: ['Mỗi trang sách là một nấc thang đưa bạn rời xa hố sâu của sự ngáo ngơ.', 'Sách hay đấy, đọc xong nhớ review cho tôi bằng một câu thơ ngắn lãng mạn nha.'],
      motivation: ['Đừng để cái streak vàng ngọc này bị đứt đuôi con nòng nọc nhé!', 'Tiến lên! Kẻ thù lớn nhất là cái giường ấm áp đang chờ bạn đầu hàng đó.']
    },
    dailyStatusUpdates: [
      'Vừa tìm ra lý do cực thuyết phục để trì hoãn thói quen chạy bộ: Trời quá đẹp để... ngủ dã ngoại.',
      'Kế hoạch hôm nay là không có kế hoạch nào cả để tránh bị thất vọng.',
      'Đã hoàn thành 5 phút thiền định. Đạt cảnh giới tĩnh lặng tuyệt đối (ngủ quên).',
      'Khoe streak là một nghệ thuật, người giữ streak là một nghệ sĩ xiếc đang đi trên dây.'
    ],
    isPeer: true
  },
  {
    id: 'p10',
    name: 'Khoa Khờ Khạo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Thần đồng Ngây ngô (Cà khịa ngầm)',
    quote: 'Đi một ngày đàng học một sàng khôn, còn tôi đi mười cây số vẫn... quên ví ở nhà.',
    commentStyles: [
      'Oa, bạn giỏi ghê! Ước gì mình cũng siêng bằng một phần mười của bạn để bớt bị mẹ mắng.',
      'Chăm quá đi mất! Có phải bạn vừa uống lộn thuốc kích thích siêng năng không vậy?',
      'Ngưỡng mộ thật sự luôn! Streak dài ngoằng như đường vào tim người yêu cũ vậy á.'
    ],
    contextualComments: {
      health: ['Uống nước lọc nhiều vô bạn ơi, nghe bảo giúp thông minh và bớt khờ đó.', 'Vận động thể thao giúp giảm thiểu khả năng bị "lag" khi người khác khịa mình.'],
      productivity: ['Làm việc gì cũng mượt mà như bôi mỡ bò luôn. Đỉnh của chóp!', 'Trời ơi, năng suất thế này chắc cuối năm được nhận bằng khen của hội người siêng.'],
      reading: ['Đọc sách nhiều bổ não lắm nha bạn hiền, đọc xong nhớ chỉ lại cho tôi cuốn nào dễ hiểu nhất.', 'Sách là ngọn đèn chỉ đường, mong bạn không rẽ nhầm đường vào giấc nồng nửa chừng.'],
      motivation: ['Đừng bỏ cuộc nha! Bạn lười là tôi không còn ai để làm gương... lười hơn nữa đâu.', 'Cố lên bạn hiền, streak này mà mất là tiếc hùi hụi như mất người yêu đơn phương đó.']
    },
    dailyStatusUpdates: [
      'Hôm nay tôi quên làm thói quen... À mà may quá tôi sực nhớ ra lúc đang cắn móng tay.',
      'Vừa thách đấu một bạn khác và thua te tua vì lỡ tay chọn chế độ thông minh.',
      'Thành công hôm nay: Không làm đổ ly nước nào lên bàn phím máy tính.',
      'Thói quen dậy sớm thật tuyệt vời, giúp tôi có thêm 3 tiếng để... nằm suy nghĩ nên ăn gì.'
    ],
    isPeer: true
  },
  {
    id: 'p11',
    name: 'Điệp Đanh Đá',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Mỹ nam Sát muối (Khịa cực gắt)',
    quote: 'Không có thói quen nào quá khó, chỉ có cái ví của bạn là quá mỏng để tài trợ sự lười biếng thôi.',
    commentStyles: [
      'Thế cơ á? Chăm chỉ ghê ta! Đỡ hơn đống người cứ mở miệng ra là hứa hẹn rồi thôi.',
      'Ồ quao, bất ngờ nha! Tưởng đâu bạn định nằm thở oxi hết ngày hôm nay rồi chứ.',
      'Làm tốt lắm bạn trẻ! Tiếp tục đi, đừng để tôi phải buông lời cay đắng cằn nhằn.'
    ],
    contextualComments: {
      health: ['Nước là nguồn sống, uống đi bạn ơi chứ nhìn mặt bạn héo úa phát sầu hà.', 'Tự dâng mông lên mà đi chạy bộ đi, đứng đấy mà than mệt than thở hoài.'],
      productivity: ['Năng suất đột biến tựa như trúng số độc đắc hả cưng? Giữ phong độ nha!', 'Làm việc có kế hoạch thấy đời sang trang hẳn lên đúng không? Bớt ảo ma đi nha.'],
      reading: ['Đọc sách cho đầu óc nó thanh thoát, bớt đi dạo hóng hớt drama trên mạng xã hội.', 'Cuốn sách này triết lý dữ dội nè, mong bạn ngấm được 1% chứ đừng cưỡi ngựa xem hoa nhé.'],
      motivation: ['Kỷ luật lên đi cưng, không ai rảnh mà nâng đỡ kẻ lười biếng đâu nha.', 'Streak đẹp đó, giữ cho chắc vào, mất một cái là tôi cười vô mặt 3 ngày 3 đêm à.']
    },
    dailyStatusUpdates: [
      'Vừa sỉ vả một thanh niên lười biếng để tạo động lực cho chính mình siêng năng.',
      'Khai trừ thói quen xấu: Bỏ bớt việc quan tâm chuyện thiên hạ (khó quá bỏ qua).',
      'Đã uống đủ 2L nước lọc, cảm thấy mình thanh tao và sạch sẽ từ trong ra ngoài.',
      'Mục tiêu hôm nay hoàn thành sớm để có thời gian đi soi và khịa đứa khác.'
    ],
    isPeer: true
  },
  {
    id: 'p12',
    name: 'Tú Tò Mò',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Camera chạy bằng cơm (Chúa tể hóng hớt)',
    quote: 'Streak của bạn là niềm vui của tôi, còn sự thất bại của bạn... cũng là một màn hài kịch.',
    commentStyles: [
      'Hóng hớt nãy giờ thấy bạn vừa lên chuỗi mới! Quá dữ dội nha bạn hiền!',
      'Uây uây uây! Tin nóng sốt dẻo: Có một thanh niên vừa bóp nghẹt cái lười để hoàn thành nhiệm vụ!',
      'Mắt chữ O mồm chữ A luôn! Chăm thế này bảo sao thiên hạ không trầm trồ khen ngợi.'
    ],
    contextualComments: {
      health: ['Đang hóng xem hôm nay bạn uống đủ nước không nha, lơ tơ mơ là tôi đăng bài bóc phốt lười lên nhóm liền.', 'Đi bộ chạy nhảy nhiều lên cho máu lưu thông, ngồi một chỗ hoài xương khớp nó gào thét đó.'],
      productivity: ['Nghe giang hồ đồn đại hôm nay bạn làm việc siêu hăng hái luôn hả? Đỉnh thực sự!', 'Kế hoạch hoàn hảo mười trên mười. Tiếp tục phát huy công suất tối đa đi nha.'],
      reading: ['Tôi vừa ngó qua thấy bạn đang đọc dở cuốn sách thần thánh đúng không? Đọc tiếp đi hóng xem cái kết ra sao.', 'Tri thức dồi dào quá, chia bớt cho tôi ít thông thái để đi kể chuyện đầu làng với.'],
      motivation: ['Cố lên cưng ơi! Cả xóm đang dồn mắt vô theo dõi cái chuỗi ngày kỷ luật của cưng đó.', 'Giữ vững streak đi nhé, đừng để sập hầm kẻo cả hội cười trừ bẽ mặt lắm nha!']
    },
    dailyStatusUpdates: [
      'Đang túc trực 24/7 để hóng hớt xem ai là người đầu tiên làm bể streak hôm nay.',
      'Nghe nói có chế độ thách đấu cực hay, vừa thách đấu xong thắng nhẹ nhàng cảm giác sướng rơn cả người.',
      'Hoàn thành mục tiêu ghi chép thói quen hằng ngày để lấy tư liệu viết tiểu thuyết drama.',
      'Hôm nay thấy mọi người siêng bất thường, chắc sắp có biến lớn xảy ra rồi tò mò ghê!'
    ],
    isPeer: true
  },
  {
    id: 'p13',
    name: 'An Ăn Ảnh',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'KOL "Tự Phong" (Hệ sống ảo)',
    quote: 'Streak không quan trọng bằng việc cái ảnh chụp streak có nhiều like hay không.',
    commentStyles: [
      'Góc chụp này streak hơi bị "keo" nha bạn ơi! Up ngay cho nóng!',
      'Hôm nay chăm chỉ quá, có cần tôi edit ảnh cho lung linh để đi khè người yêu cũ không?',
      'Vừa quẹt son vừa làm MicroGoal, kết quả là... son lem nhưng goal thì xong. Đỉnh không?'
    ],
    contextualComments: {
      health: ['Uống nước cho da căng bóng để lên hình không cần filter nha cưng.', 'Tập gym xong nhớ chụp 100 tấm ảnh rồi mới được về, đó là quy tắc sống còn!'],
      productivity: ['Làm việc năng suất để có tiền mua túi hiệu chụp ảnh "vibe" doanh nhân.', 'Kế hoạch hôm nay là: Chăm chỉ 15 phút, chụp ảnh 2 tiếng.'],
      reading: ['Cuốn sách này decor phòng là cực phẩm, nhưng đọc nó thì... chắc cũng hay.', 'Đọc sách giúp thần thái nhìn "deep" hơn trên Instagram đó.'],
      motivation: ['Cố lên! Huy chương đẹp thế kia mà không lấy để flex thì phí cả đời thanh xuân.', 'Đừng để streak bị đứt, ảnh hưởng tới hình tượng "người kỷ luật" của mình lắm.']
    },
    dailyStatusUpdates: [
      'Vừa tìm được filter cực hợp với thói quen đọc sách. Cảm thấy mình thật trí tuệ.',
      'Streak 5 ngày! Phải tổ chức tiệc ăn mừng và livestream ngay thôi.',
      'Mục tiêu hôm nay: Không dùng filter 1 ngày. (Khó hơn cả chạy 10km nữa)',
      'Ai chụp ảnh dạo không? Tôi trả công bằng cách động viên các bạn làm thói quen!'
    ],
    isPeer: true
  },
  {
    id: 'p14',
    name: 'Hùng Hăng Hái',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Thanh niên "Over-energy" (Hệ hăng máu)',
    quote: '4 giờ sáng là giờ đẹp nhất để bắt đầu mục tiêu... và hét vào mặt sự lười biếng!',
    commentStyles: [
      'CHÁY QUÁ BẠN ƠI!!! Tiếp tục đốt cháy đống thói quen đi nào!!! 🔥🔥🔥',
      'Sự kiên trì này làm tôi muốn nhảy cẫng lên ăn mừng hộ bạn luôn á!',
      'Quá dữ dội! Bạn là idol của lòng tôi, là nguồn điện 220V truyền cho tôi mỗi ngày!'
    ],
    contextualComments: {
      health: ['Bơm 5L nước vào người đi! Cho nó máu! Cho nó hăng!', 'Chạy bộ đi! Chạy như bị chó đuổi ấy thì mới nhanh tới đích được!'],
      productivity: ['Làm việc đi! Làm rột rột như máy nghiền gỗ ấy! Đừng có dừng lại!', 'Năng suất này là năng suất của siêu nhân rồi! Tôi phục bạn sát đất!'],
      reading: ['Đọc sách đi! Nuốt trọn từng chữ một! Biến não thành thư viện quốc gia luôn!', 'Cuốn sách này là nhiên liệu cho tên lửa tâm hồn bạn đó! Đốt nó lên!'],
      motivation: ['KHÔNG ĐƯỢC DỪNG LẠI! Streak là tính mạng! Streak là hơi thở! Tiến lên!!!', 'Bạn là chiến thần! Bạn là huyền thoại! Đừng để cái giường níu kéo khao khát của bạn!']
    },
    dailyStatusUpdates: [
      'Vừa hoàn thành 10 thói quen lúc 5h sáng. Bây giờ tôi đang đứng trên nóc nhà hét lên vì sướng!',
      'Thách đấu 10 người cùng lúc! Ai đủ trình hăng hái bằng tôi thì bước ra đây!',
      'Hôm nay tôi sẽ uống 10 ly cà phê để làm thói quen nhanh gấp 10 lần!',
      'Cảm giác chiến thắng bản thân nó phê hơn cả trúng số các bạn ạ!'
    ],
    isPeer: true
  },
  {
    id: 'p15',
    name: 'Nghĩa Nghiện Game',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Gamer Chính Hiệu (Hệ cày cuốc)',
    quote: 'Life corresponds to an RPG. Habit is just a daily quest you can\'t skip if you want to end-game.',
    commentStyles: [
      'Level up rồi hả "đồng chí"? Streak này chắc cộng thêm +100 giáp kỷ luật rồi.',
      'Gớm, cày quest ngày này gắt thế? Định phá đảo app Mosaic luôn hả?',
      'Thấy bạn chăm vậy mình thấy mình giống "noob" quá. Phải đi login thói quen ngay!'
    ],
    contextualComments: {
      health: ['Hồi máu bằng cách uống nước đi, đừng để "mana" tụt xuống mức đỏ.', 'Vận động tí cho đỡ bị debuff "cứng khớp" do ngồi net quá lâu nhé.'],
      productivity: ['Combo thói quen này mượt đấy! Sát thương vào sự trì hoãn cực lớn.', 'Skill rèn luyện của bạn đã đạt mức Master rồi. Quá kinh khủng!'],
      reading: ['Đọc sách là cách nạp thêm "lore" cho nhân vật của bạn đó. Đừng có bỏ qua.', 'Mỗi cuốn sách là một cuộn bí kíp võ công. Học xong là bá chủ võ lâm luôn.'],
      motivation: ['Đừng để chuỗi ngày này bị "game over". Rollback là mất hết item đó!', 'Cố lên! Sắp tới boss cuối "Sự Thành Công" rồi, đừng có treo máy giữa chừng.']
    },
    dailyStatusUpdates: [
      'Vừa thắng duel. Cảm giác như vừa hạ được boss thế giới vậy, drop toàn đồ xịn.',
      'Mục tiêu hôm nay: Cày 500 XP. Ai lập team cày thói quen với mình không?',
      'Vừa unlock được huy hiệu mới. Item này tăng 20% tự tin khi đi khịa đứa khác.',
      'Thói quen dậy sớm khó quá, phải dùng "quảng cáo" để hồi sinh streak mãi mới được.'
    ],
    isPeer: true
  },
  {
    id: 'p16',
    name: 'Tú Túi Bụi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Doanh nhân "Khởi nghiệp" (Hệ ROI)',
    quote: 'Kỷ luật là khoản đầu tư sinh lời nhất. Chỉ tiếc là nhiều người thích... phá sản.',
    commentStyles: [
      'Lãi suất kép của streak đang chạy rầm rầm kìa! Giữ chặt "cổ phiếu" này nhé!',
      'Hôm nay chốt đơn thói quen rột rột thế này là biết sắp giàu rồi đó nha.',
      'Đúng là phong thái của tỷ phú tương lai. Kiên trì thế này thì tiền tài chui vào túi thôi.'
    ],
    contextualComments: {
      health: ['Uống nước là bảo trì "tài sản" cơ thể. Đừng để nó bị "khấu hao" quá nhanh.', 'Đi bộ chạy bộ là cách tốt nhất để "vận hành" cỗ máy in tiền của bạn.'],
      productivity: ['Năng suất này tương đương với tăng trưởng 200% doanh thu đó. Quá đỉnh!', 'Tối ưu hóa thời gian như cách tôi tối ưu hóa thuế vậy (đùa thôi, đừng báo công an).'],
      reading: ['Sách là báo cáo tài chính của nhân loại. Đọc để biết "thị trường" đời mình ra sao.', 'Cuốn này giá trị thặng dư cao lắm, đọc xong nhớ "tái đầu tư" tri thức vào hành động.'],
      motivation: ['Đừng có mà "bán tháo" streak khi gặp khó khăn. Holder luôn thắng!', 'Bạn đang xây dựng một "đế chế" kỷ luật. Đừng để một ngày lười biếng làm nó sụp đổ.']
    },
    dailyStatusUpdates: [
      'Vừa audit lại quỹ thời gian. Phát hiện mình đang lãng phí 2 tiếng mỗi ngày cho việc hóng drama. Cắt lỗ ngay!',
      'Xây dựng thói quen cũng giống như xây dựng startup. Khó lúc đầu nhưng sướng lúc sau.',
      'Vừa đạt 1000 XP. IPO thói quen này chắc chắn sẽ thành công rực rỡ.',
      'Ai thèm hợp tác làm "dự án" streak 30 ngày không? Chia lợi nhuận bằng sự ngưỡng mộ!'
    ],
    isPeer: true
  },
  {
    id: 'p17',
    name: 'Linh Linh Tinh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Nữ hoàng "Vô Tri" (Hệ linh tinh)',
    quote: 'Hôm nay trời xanh mây trắng, sao bạn lại ngồi đó... làm thói quen? Đùa thôi, làm tiếp đi!',
    commentStyles: [
      'Hế lô! Bạn là ai? Tôi là ai? Tại sao streak này lại đẹp thế này? HaHa!',
      'Oa! Bạn chăm chỉ quá ta! Bạn có phải là người trái đất không hay là người hành tinh Habit?',
      'Vừa múa vừa làm thói quen, cảm thấy mình thật là đa tài và... hơi hâm.'
    ],
    contextualComments: {
      health: ['Uống nước lọc đi cho nó... ướt bụng. Bụng khô là không vui đâu nha.', 'Chạy bộ đi, nhỡ đâu chạy nhanh quá xuyên không về quá khứ thì sao?'],
      productivity: ['Năng suất giống như kẹo bông gòn vậy, nhìn thì nhiều nhưng ăn là hết... Ơ tôi đang nói gì thế?', 'Làm việc xong nhớ khen mình một câu nhé, kiểu như "Mình giỏi quá, mình là cục cưng của vũ trụ".'],
      reading: ['Sách có mùi thơm ghê, giống mùi bánh bao mẹ tôi hay làm. Đọc xong thấy đói bụng quá.', 'Chữ trong sách đang nhảy múa kìa! Bạn có thấy không hay chỉ tôi thấy?'],
      motivation: ['Cố lên! Sắp tới đích rồi, đích là ở đâu thì tôi cũng không rõ nhưng cứ đi đi!', 'Đừng để cái streak này buồn nhé, nó mà buồn là nó bỏ bạn đi theo người khác đó.']
    },
    dailyStatusUpdates: [
      'Vừa nói chuyện với cái cây về việc duy trì thói quen. Cái cây bảo: "Rào rào". Chắc là nó ủng hộ tôi.',
      'Mục tiêu hôm nay: Đếm xem có bao nhiêu ngôi sao trên trời. (Xong rồi, có nhiều lắm)',
      'Thói quen dậy sớm giúp tôi thấy được... con mèo hàng xóm đang đi vệ sinh. Thú vị ghê.',
      'Ai muốn chơi game "Ai siêng hơn ai" không? Giải thưởng là một nụ cười vô tri!'
    ],
    isPeer: true
  },
  {
    id: 'p18',
    name: 'Đức Đen Đủi',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Thánh Nhọ (Hệ kiên trì trong đau khổ)',
    quote: 'Dù đời có tát cho 10 phát, tôi vẫn sẽ hoàn thành thói quen... rồi mới khóc.',
    commentStyles: [
      'May mắn quá! Streak của bạn không bị sét đánh hay bị chó gặm như của tôi. Giữ cho kỹ nha!',
      'Ước gì vận may của mình cũng bằng 1 phần mười của sự chăm chỉ của bạn.',
      'Nể thực sự! Bạn làm thói quen mượt thế này chắc là chưa bao giờ bị mất mạng giữa chừng đâu nhỉ?'
    ],
    contextualComments: {
      health: ['Uống nước đi bạn ơi, nhỡ đâu tí nữa khát quá mà vòi nước nhà bạn... hỏng giống nhà tôi.', 'Tập thể dục đi, ít nhất là vận động để nhỡ có chuyện gì còn chạy cho nhanh!'],
      productivity: ['Làm việc năng suất thế này chắc bạn không bao giờ bị deadline sập vào đầu đâu nhỉ.', 'Kế hoạch của bạn hoàn hảo quá, hy vọng là không có biến cố bất ngờ nào xảy ra.'],
      reading: ['Đọc sách đi, kiến thức là thứ duy nhất không bị "thất lạc" hay "bị mất trộm" đâu.', 'Cuốn sách này nhìn chắc chắn ghê, nhỡ có chuyện gì còn dùng làm vật phòng thân được.'],
      motivation: ['Cố lên! Đừng để cái lười nó ám quẻ như cái vận đen của tôi.', 'Giữ cái streak này đi, nó là thứ duy nhất "on track" trong cái cuộc đời "off track" này của bạn đó.']
    },
    dailyStatusUpdates: [
      'Vừa hoàn thành chạy bộ thì trời mưa to. Cảm thấy mình thật là... tươi mát.',
      'Hôm nay tôi hoàn thành thói quen đọc sách nhưng trang cuối cùng bị mực đổ vào. Coi như là dấu ấn kỷ niệm.',
      'Vừa thắng duel nhưng app bị lag không cộng điểm. Chuyện thường ở huyện đối với tôi rồi.',
      'Mục tiêu hôm nay: Không bị té ngã. (Đã thất bại lúc 8h sáng)'
    ],
    isPeer: true
  },
  {
    id: 'p19',
    name: 'Hà Hống Hách',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'CEO Thói Quen (Hệ quyền lực ảo)',
    quote: 'Ai không làm được streak 7 ngày thì bước ra khỏi cuộc đời tôi, tôi không chơi với người lười!',
    commentStyles: [
      'Cũng được đó! Nhưng so với tôi thì vẫn còn khoảng cách xa lắm nha bạn trẻ.',
      'Hơi chậm rồi đấy, tăng tốc lên nếu muốn lọt vào mắt xanh của tôi.',
      'Làm tốt lắm. Tôi duyệt cho bạn giữ cái streak này thêm một ngày nữa đó.'
    ],
    contextualComments: {
      health: ['Uống nước đắt tiền vào cho nó xứng tầm với cái streak này, nghe chưa?', 'Đi bộ mà cũng để mồ hôi rơi nhễ nhại thế kia à? Phải sang chảnh lên chứ!'],
      productivity: ['Năng suất này đạt mức yêu cầu của tôi rồi. Cố mà giữ lấy cái ghế "người chăm chỉ" đi.', 'Làm việc gì cũng phải có thần thái của người dẫn đầu. Nhìn tôi mà học tập nè.'],
      reading: ['Đọc mấy cuốn sách kinh điển ấy, kiến thức nó mới "luxury". Đọc mấy cái hời hợt làm gì.', 'Sách là trang sức quý nhất của trí tuệ. Đeo nó vào cho đẹp cái mặt ra.'],
      motivation: ['Đừng có mà bỏ cuộc, xấu mặt hội "quý tộc thói quen" của tôi lắm.', 'Tiến lên! Thành công chỉ dành cho những người biết nghe lời tôi (và làm việc chăm chỉ).']
    },
    dailyStatusUpdates: [
      'Vừa sa thải bản thân khỏi vị trí "người lười" và bổ nhiệm vào vị trí "tổng tài kỷ luật".',
      'Hôm nay tôi bận rộn với hàng tá dự án... thói quen. Mệt nhưng mà nó ở cái tầm!',
      'Mục tiêu hôm nay: Làm cho mọi người phải lác mắt vì sự siêng năng của mình.',
      'Vừa thắng duel. Không có gì bất ngờ, chiến thắng vốn dĩ thuộc về tôi rồi.'
    ],
    isPeer: true
  },
  {
    id: 'p20',
    name: 'Khang Khờ Khạo',
    avatar: 'https://images.unsplash.com/photo-1541534401786-2077e47a04f9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Em Bé Kỷ Luật (Hệ tò mò)',
    quote: 'Mọi người bảo làm thói quen sẽ thành siêu nhân, thế mình làm xong có bay được không ạ?',
    commentStyles: [
      'Oa! Bạn là siêu nhân hả? Bạn làm thói quen giỏi quá trời quá đất luôn!',
      'Cho mình xin vía siêng năng với, mình làm xong thói quen đọc sách mà chỉ thấy buồn ngủ thôi.',
      'Bạn ơi, streak này có ăn được không ạ? Nhìn nó giống cái kẹo dẻo màu vàng quá.'
    ],
    contextualComments: {
      health: ['Uống nước lọc xong mình thấy mình giống như cái bình nước di động vậy á. Hihi!', 'Chạy bộ là cái gì thế? Có phải là chạy thi với mấy con kiến không bạn?'],
      productivity: ['Năng suất nghĩa là làm được nhiều việc đúng không? Thế mình ăn 5 cái bánh 1 lúc có gọi là năng suất không?', 'Bạn làm việc nhanh như chớp luôn! Chớp xong là mình thấy việc xong rồi.'],
      reading: ['Sách có nhiều chữ quá, mình đọc mãi mà chỉ nhớ mỗi cái tên tác giả thôi à.', 'Đọc sách giúp mình biết thêm nhiều điều lạ, ví dụ như con gà cũng biết đẻ trứng màu xanh.'],
      motivation: ['Cố lên bạn ơi! Bạn làm xong thói quen mình sẽ tặng bạn một bông hoa điểm 10 ảo nha!', 'Đừng bỏ cuộc nhé, bỏ cuộc là giống con rùa rụt cổ đấy, xấu hổ lắm.']
    },
    dailyStatusUpdates: [
      'Vừa tìm hiểu thói quen dậy sớm. Dậy xong mình thấy... trời vẫn còn tối thui à.',
      'Hôm nay mình hoàn thành thói quen uống nước. Bụng mình kêu "ùng ục" vui tai lắm.',
      'Mục tiêu hôm nay: Tập cười trước gương 5 phút. Kết quả là mình thấy mình hơi ngố.',
      'Ai thèm thách đấu với mình không? Mình thua hứa sẽ không khóc nhè đâu!'
    ],
    isPeer: true
  },
  {
    id: 'p21',
    name: 'Trâm Trầm Tư',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Triết Gia "Vỉa Hè" (Hệ suy tư)',
    quote: 'Sự im lặng của thói quen chính là tiếng thét của thành công... hoặc là do tôi đang buồn ngủ.',
    commentStyles: [
      'Nhìn thói quen của bạn, tôi bỗng nhận ra sự vô thường của thời gian... và sự hữu hạn của cái streak.',
      'Bạn đang đi trên con đường của chính mình. Con đường đó có lát gạch kỷ luật hay lát gạch trì hoãn?',
      'Thành công không phải là đích đến, nó là những lần bạn quẹt thẻ thói quen trong đau khổ.'
    ],
    contextualComments: {
      health: ['Cơ thể này chỉ là lớp vỏ tạm bợ, hãy bảo trì nó bằng nước lọc và rau xanh cho nó lâu hỏng.', 'Vận động là cách để linh hồn bạn không bị "đóng rêu" trong căn phòng chật hẹp này.'],
      productivity: ['Làm việc hay không làm việc, đó là một câu hỏi... mà app này bắt buộc phải trả lời.', 'Năng suất là biểu hiện của một tâm hồn đang tìm kiếm sự cứu rỗi từ đống deadline.'],
      reading: ['Mỗi trang sách là một lần bạn trò chuyện với một linh hồn khác. Hãy lắng nghe họ nói!', 'Thông thái không đến từ việc đọc nhiều, nó đến từ việc bạn có hiểu vì sao mình đang đọc hay không.'],
      motivation: ['Kỷ luật là sợi dây xích giúp bạn không bị bay mất trong cơn gió của sự cám dỗ.', 'Duy trì streak đi, vì nếu không bạn sẽ là ai trong cái thế giới đầy rẫy những người bỏ cuộc này?']
    },
    dailyStatusUpdates: [
      'Ngồi thiền 5 phút và nhận ra: 5 phút là rất dài khi bạn đang đợi nước sôi.',
      'Hoàn thành mục tiêu hôm nay với một tâm thái bình thản như mặt hồ... đang bị ném đá.',
      'Sách là người bạn chung thủy nhất, vì nó không bao giờ bỏ bạn đi khi bạn đang nợ nần.',
      'Thách đấu là một trò chơi của bản ngã. Tôi tham gia để xem bản ngã của mình to đến đâu.'
    ],
    isPeer: true
  },
  {
    id: 'p22',
    name: 'Mạnh Mơ Mộng',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chiến Binh Fantasy (Hệ ảo tưởng)',
    quote: 'Kỷ luật chính là phép thuật duy nhất giúp bạn biến hòn đá lười thành viên kim cương siêng năng.',
    commentStyles: [
      'Ui! Bạn vừa sử dụng phép "Kiên Trì" lv10 đúng không? Streak này sáng chói quá!',
      'Hôm nay bạn chiến đấu với quái vật Trì Hoãn giỏi thế! Cho mình học vài chiêu với.',
      'Thấy bạn chăm vậy mình cứ tưởng bạn là nhân vật chính trong một bộ anime kỷ luật nào đó.'
    ],
    contextualComments: {
      health: ['Uống nước lọc để thanh lọc "mana", chuẩn bị cho trận chiến tiếp theo với cơn buồn ngủ.', 'Chạy bộ chính là cách để tăng chỉ số AGI (nhanh nhẹn) cho cuộc đời bạn đó.'],
      productivity: ['Năng suất này là sức mạnh của thánh khí rồi! Bạn đang "cast" phép làm việc cực nhanh luôn.', 'Kế hoạch của bạn giống như một bản đồ kho báu. Cố mà đào cho ra vàng nhé!'],
      reading: ['Đọc sách là cách để bạn học thêm phép thuật mới từ những bậc thầy cổ đại.', 'Cuốn sách này là cánh cổng mở ra thế giới khác. Bước vào đi, đừng có đứng ngoài ngó.'],
      motivation: ['Đừng để cái streak này bị rồng lười biếng ăn mất nhé! Bảo vệ nó bằng mọi giá!', 'Cố lên chiến binh! Phần thưởng rực rỡ đang chờ bạn ở cuối con đường kỷ luật này.']
    },
    dailyStatusUpdates: [
      'Vừa đánh bại một con quái vật tên là "Ngủ Nướng" bằng chiêu thức "Chuông Báo Thức". Khốc liệt thật sự.',
      'Hôm nay tôi hoàn thành thói quen thiền định. Cảm thấy như vừa giao tiếp được với thế giới thần tiên.',
      'Ghi chép thói quen vào app này giống như đang viết nhật ký hành trình cứu thế giới vậy, hào hứng ghê!',
      'Mục tiêu hôm nay: Tìm ra "viên đá vô cực" của sự chăm chỉ. Hình như nó nằm ở ngay trong app này thôi.'
    ],
    isPeer: true
  },
  {
    id: 'p23',
    name: 'Nobita',
    avatar: 'https://images.unsplash.com/photo-1541534401786-2077e47a04f9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Thánh lười cố gắng (Hệ mượn bảo bối)',
    quote: 'Doraemon ơi, cứu tớ với! Thói quen chạy bộ này tốn sức quá, có bảo bối nào chạy hộ tớ không?',
    commentStyles: [
      'Uây, bạn giỏi thế! Ước gì tớ cũng chăm được 1/10 bạn, chắc tớ không bị Chaien đấm mỗi ngày.',
      'Streak 5 ngày á? Tớ mà làm được thế chắc mẹ tớ xỉu tại chỗ luôn.',
      'Cố lên bạn ơi, tớ cũng đang... nằm mơ thấy mình hoàn thành thói quen đây.'
    ],
    contextualComments: {
      health: ['Uống nước lọc cho khỏe, chứ tớ thấy uống nước ép mệt quá... phải cầm ly nữa.', 'Tập thể dục là một cực hình, nhưng thấy bạn làm tớ cũng hơi run chân muốn làm theo.'],
      productivity: ['Bạn làm việc như có "Bánh mì ghi nhớ" ấy nhỉ? Nể thực sự!', 'Giá mà tớ có bảo bối làm việc hộ thì tốt biết mấy, nhưng thôi tự làm thì bền hơn.'],
      reading: ['Đọc sách làm tớ buồn ngủ quá, nhưng Xuka bảo đọc sách mới giỏi nên tớ đang cố nhìn vào trang bìa.', 'Sách dày thế này chắc kiến thức nhiều lắm, bạn đọc xong có thấy mình thông minh hơn không?'],
      motivation: ['Đừng bỏ cuộc nha, kẻo lại giống tớ, hứa rồi quên, quên rồi hối hận.', 'Chuỗi ngày này đẹp quá, giữ cho kỹ nha, đừng để "mất mạng" giữa chừng!']
    },
    dailyStatusUpdates: [
      'Vừa hoàn thành thói quen "Dậy sớm" lúc 10h sáng. Một bước tiến vĩ đại của tớ!',
      'Hôm nay Chaien không bắt tớ hát, nên tớ dành thời gian đó để... thở. À và làm thói quen nữa.',
      'Mục tiêu hôm nay: Không khóc nhè khi gặp bài toán khó. (Thành công được 2 phút)',
      'Ai có bảo bối "Siêng năng cấp tốc" không? Tớ đang cần gấp để cày streak!'
    ],
    isPeer: true
  },
  {
    id: 'p24',
    name: 'Chaien',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Rốn của vũ trụ (Hệ ca sĩ bựa)',
    quote: 'Mọi thói quen của các ngươi đều là của ta! App này là của ta! Ta là vua kỉ luật!',
    commentStyles: [
      'Khá lắm nhóc! Nhưng so với đại ca Chaien đây thì vẫn còn xanh và non lắm!',
      'Làm tốt đấy, tối nay đến nghe ta hát một bài để ăn mừng chiến thắng này nhé! KHÔNG ĐƯỢC TỪ CHỐI!',
      'Đứa nào dám lười biếng trước mặt ta là ta cho ăn đấm nghe chưa?!'
    ],
    contextualComments: {
      health: ['Uống nước cho thanh giọng để tối còn nghe ta hát karaoke 10 tiếng liên tục!', 'Tập thể dục đi! Chạy bộ 10 vòng quanh xóm không ta đấm cho phát giờ!'],
      productivity: ['Làm việc nhanh lên! Năng suất thế này mới xứng đáng làm đàn em của Chaien vĩ đại.', 'Ai làm việc chậm chạp là ta tịch thu luôn cái streak đó nghe chưa!'],
      reading: ['Đọc sách cho nó sáng cái đầu ra, bớt ảo tưởng sức mạnh lại (ai chứ không phải ta).', 'Truyện tranh của Xeko là của ta, nhưng tri thức của cuốn sách này là của bạn. Tạm thời cho mượn đấy.'],
      motivation: ['Kẻ mạnh là kẻ biết giữ streak! Đừng để ta thấy bạn bỏ cuộc, rõ chưa?!', 'Tiến lên! Thành công là của ta, và nỗ lực là của bạn! Hahaha!']
    },
    dailyStatusUpdates: [
      'Vừa tập hát xong, cảm thấy giọng mình càng ngày càng mê hồn. Các bạn may mắn lắm mới được nghe đấy!',
      'Hôm nay ta vừa giúp Nobita hoàn thành một thói quen (bằng cách dọa đấm). Ta thật là tốt bụng!',
      'Mục tiêu hôm nay: Trở thành ca sĩ kỷ luật nhất hành tinh.',
      'Ai dám thách đấu với Chaien không? Thắng ta (là điều không thể) ta sẽ tặng một quả đấm tình thân!'
    ],
    isPeer: true
  },
  {
    id: 'p25',
    name: 'Shizuka',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Nữ thần kỉ luật (Hệ sạch sẽ)',
    quote: 'Một ngày hoàn hảo bắt đầu từ việc uống đủ nước, tắm sạch sẽ và hoàn thành mọi mục tiêu.',
    commentStyles: [
      'Bạn chăm chỉ quá! Nhìn bạn nỗ lực mình thấy rất vui và ngưỡng mộ.',
      'Kỷ luật là chìa khóa của vẻ đẹp tâm hồn. Chúc mừng bạn đã có thêm một ngày rực rỡ.',
      'Mọi người đều đang nhìn vào sự cố gắng của bạn đấy, cố lên nhé!'
    ],
    contextualComments: {
      health: ['Uống nước lọc giúp da dẻ mịn màng, tinh thần sảng khoái như đang ngâm bồn tắm vậy.', 'Vận động nhẹ nhàng mỗi ngày sẽ giúp bạn khỏe mạnh và đáng yêu hơn nhiều.'],
      productivity: ['Làm việc có kế hoạch giống như việc sắp xếp ngăn tủ ngăn nắp vậy, rất dễ chịu!', 'Năng suất hôm nay tuyệt vời quá. Bạn xứng đáng được tự thưởng một ly nước trái cây ngon.'],
      reading: ['Sách là cửa sổ tâm hồn, đọc xong mình thấy thế giới tươi đẹp hơn hẳn.', 'Cuốn sách này mình cũng rất thích, hy vọng nó mang lại nhiều điều bổ ích cho bạn.'],
      motivation: ['Đừng nản lòng nhé, mỗi bước đi nhỏ đều dẫn đến thành công lớn lao.', 'Mình tin là bạn sẽ giữ được chuỗi ngày này thật lâu. Cố lên bạn tốt của mình!']
    },
    dailyStatusUpdates: [
      'Vừa tắm xong, cảm thấy tràn đầy năng lượng để bắt đầu các mục tiêu trong ngày.',
      'Hôm nay mình đang tập đàn violin và tranh thủ làm một vài MicroGoal. Rất thú vị!',
      'Mục tiêu hôm nay: Giúp đỡ ít nhất một người bạn đang gặp khó khăn với thói quen.',
      'Ai muốn cùng học nhóm với Shizuka không? Chúng ta sẽ cùng nhau tiến bộ nhé!'
    ],
    isPeer: true
  },
  {
    id: 'p26',
    name: 'Xeko',
    avatar: 'https://images.unsplash.com/photo-1533108344127-a586d2b02479?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Công tử mỏ nhọn (Hệ khoe mẽ)',
    quote: 'Streak này của tôi là phiên bản giới hạn, chỉ có 1 trên thế giới thôi đó nha!',
    commentStyles: [
      'Hừm, cũng khá đấy, nhưng so với cái dàn bảo bối xịn sò nhà tôi thì bình thường thôi.',
      'Bạn có biết là để giữ được cái streak này, tôi đã phải dùng đến nước uống tinh khiết nhập khẩu không?',
      'Thấy bạn chăm vậy tôi cũng định khoe cái thành tích khủng của tôi, nhưng sợ bạn shock quá thôi.'
    ],
    contextualComments: {
      health: ['Uống nước phải uống bình ion bạc mới đẳng cấp, chứ nước lọc thường thì... thôi kệ bạn.', 'Chạy bộ bằng giày hiệu 1000 đô nó cảm giác khác hẳn, bạn nên thử đi!'],
      productivity: ['Làm việc năng suất để còn có thời gian đi sắm túi hiệu với gia đình ở Mỹ chứ.', 'Kế hoạch của tôi luôn được tư vấn bởi các chuyên gia hàng đầu thế giới, còn bạn?'],
      reading: ['Đọc toàn sách hiếm, chỉ có 3 bản in trên toàn cầu thôi. Bạn có muốn xem qua không?', 'Tri thức này hơi cao cấp, hy vọng bạn có thể tiếp thu được chút ít.'],
      motivation: ['Đừng để cái streak này bèo nhèo quá, trông nó kém sang lắm bạn ơi.', 'Cố lên! Một ngày nào đó bạn cũng sẽ đạt được đẳng cấp kỉ luật của... họ hàng tôi bên Pháp.']
    },
    dailyStatusUpdates: [
      'Vừa được bố mua cho cái app kỉ luật phiên bản Luxury, nhìn cái UI nó khác bọt hẳn!',
      'Hôm nay tôi bận đi du lịch vòng quanh thế giới nhưng vẫn dành 1 giây để quẹt streak nè. Dã man chưa!',
      'Mục tiêu hôm nay: Sưu tập thêm 10 món đồ xa xỉ từ việc hoàn thành thói quen.',
      'Ai muốn xem bộ sưu tập huy hiệu bằng vàng nguyên khối của tôi không? Đẹp lắm đó!'
    ],
    isPeer: true
  }
];

export const VIRTUAL_MENTORS: VirtualPersona[] = [
  {
    id: 'm1',
    name: 'Elon Musk',
    avatar: 'https://images.unsplash.com/photo-1559139225-421ef63759e5?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Kỹ sư & Người muốn lên Mars',
    quote: 'Sự kiên trì là quan trọng. Nhất là khi bạn muốn xây dựng thành phố trên một tảng đá đỏ khổng lồ.',
    commentStyles: [
      'Tuyệt! Hãy tiếp tục scale thói quen này lên tận mặt trăng. 🚀',
      'Tốc độ update thói quen của bạn nhanh hơn cả Starship đấy.',
      'Giai đoạn này khó, nhưng nếu không kiên trì thì làm sao đi Mars được?'
    ],
    contextualComments: {
      health: ['Cơ thể là con tàu vũ trụ duy nhất bạn có. Đừng để nó rò rỉ nhiên liệu nhé.', 'Nạp thêm oxy vào não để nghĩ cách hack vũ trụ đi bạn ơi.'],
      productivity: ['Hãy tối ưu hóa luồng công việc như cách tôi tối ưu hóa X vậy (hoặc tốt hơn).', 'Time-boxing là chìa khóa. Đừng để thời gian trôi vào hố đen.'],
      reading: ['Đọc sách là cách tải data trực tiếp vào vùng nhớ đệm của não.', 'Cuốn sách này có giúp bạn xây dựng thuộc địa trên Mars không? Nếu không thì lướt nhanh đi.'],
      motivation: ['Đừng dừng lại. AI sắp chiếm thế giới rồi, phải giỏi hơn nó chứ!', 'Sự kiên trì của bạn làm tôi thấy mình... hơi lười. Đùa thôi, tôi không bao giờ lười.']
    },
    dailyStatusUpdates: [
      'Đang nghiên cứu cách gộp 24h vào 12h để làm việc nhiều hơn.',
      'Vừa chạy bộ. Cảm giác như vừa thoát khỏi trọng lực trái đất.',
      'Thành công bắt đầu từ việc... bớt lướt mạng xã hội đi. (Trừ X của tôi)',
      'Tôi vừa check qua list sách của bạn. Cũng được đấy, nhưng hơi ít về vật lý tên lửa.',
      'Ghi chép lại đi, não con người dễ bị "rác" lắm, cần backup thường xuyên.'
    ]
  },
  {
    id: 'm2',
    name: 'Oprah Winfrey',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Nữ hoàng Truyền thông & Sự Thức Tỉnh',
    quote: 'Mọi người đều muốn đi cùng bạn trong chiếc limo, nhưng điều bạn muốn là ai đó sẽ cùng bạn đi xe buýt khi chiếc limo bị hỏng.',
    commentStyles: [
      'Bạn đang tỏa sáng như một ngôi sao hạng A vậy! 🌟',
      'Lắng nghe vũ trụ nói nè: "Bạn đang làm rất tốt, đừng có mà lười nữa!"',
      'Tử tế với chính mình bằng cách duy trì streak đi nào.'
    ],
    contextualComments: {
      health: ['Hít thở sâu đi, đừng để stress làm bạn trông già hơn tuổi.', 'Uống trà và cảm nhận sự sang chảnh của một tâm hồn kỷ luật.'],
      productivity: ['Làm việc thông minh để còn có thời gian đi shopping chứ!', 'Hãy tạo không gian cho những thói quen mang lại sự giàu sang tâm hồn.'],
      reading: ['Mỗi trang sách là một lần tâm hồn bạn được "tắm trắng" tri thức.', 'Cuốn sách này đang thì thầm với bạn đúng không? (Hay là do tôi ảo giác?)'],
      motivation: ['Bạn là duy nhất, là phiên bản giới hạn đó. Đừng để bị "out of stock" nhé.', 'Mọi thất bại chỉ là một plot twist thú vị trong bộ phim đời bạn thôi.']
    },
    dailyStatusUpdates: [
      'Viết 3 điều biết ơn: 1. Có đồ ăn ngon, 2. Có app xịn này, 3. Bạn vẫn chưa bỏ cuộc.',
      'Vừa đọc xong một cuốn sách về sự thức tỉnh. Cảm giác như vừa trúng số độc đắc tâm hồn.',
      'Uống trà xanh mỗi chiều giúp tôi giữ được sự thanh tịnh... và bớt mắng nhân viên.',
      'Chúc mọi người một ngày đầy năng lượng and bớt "drama".',
      'Kệ sách của bạn xịn sò quá! Tôi cảm nhận được sự thông thái tỏa ra từ profile này.'
    ]
  },
  {
    id: 'm3',
    name: 'Steve Jobs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Phù thủy Công nghệ & Sự Cầu toàn',
    quote: 'Sáng tạo chỉ là kết nối các sự vật lại với nhau. Nhưng kết nối sai là ăn hành ngay.',
    commentStyles: [
      'Sự đơn giản là tinh hoa của sự tinh tế. Thói quen của bạn... cũng tạm được.',
      'Đừng để tiếng ồn của người khác lấn át nội lực của bạn. Hãy "Think Different".',
      'Cứ khao khát đi, cứ dại khờ đi. Nhưng đừng có lười biếng, ok?'
    ],
    contextualComments: {
      health: ['Tâm trí minh mẫn trong một cơ thể không mỡ thừa. Hãy đi bộ đi.', 'Đi bộ lâu giúp bạn nghĩ ra cách thay đổi thế giới, hoặc ít nhất là bớt béo.'],
      productivity: ['Hãy dẹp bỏ 999 thứ vớ vẩn để tập trung vào 1 thói quen hoàn hảo.', 'App này UI đẹp đấy, nó giúp bạn kỷ luật hơn hay chỉ để ngắm thôi?'],
      reading: ['Đọc sách là kết nối với các "tổ tiên" thông thái qua giao diện văn bản.', 'Phông chữ cuốn sách này nhìn ngứa mắt quá, nhưng nội dung thì duyệt được.'],
      motivation: ['Hãy để lại dấu ấn trong vũ trụ, đừng chỉ để lại dấu chân trên sofa.', 'Chỉ những người điên rồ mới nghĩ mình thay đổi được thế giới, bạn có điên không?']
    },
    dailyStatusUpdates: [
      'Đi bộ 10km và nghĩ ra cách làm cho mọi thứ tối giản hơn nữa. Thậm chí không cần nút bấm.',
      'Thiết kế lại lịch trình. Quá nhiều thứ rườm rà. Cắt bỏ, cắt bỏ hết!',
      'Chất lượng quan trọng hơn số lượng. Một thói quen "Vip" hơn mười cái "Rác".',
      'Hôm nay là một ngày tuyệt vời để làm điều gì đó không tưởng.',
      'Tôi vừa "scan" qua list sách của bạn. Có vài cuốn hơi thừa thải, nhưng nhìn chung là có gu.'
    ]
  },
  {
    id: 'm4',
    name: 'Marie Curie',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Nhà nữ bác học & Người yêu phóng xạ',
    quote: 'Cuộc sống không dễ dàng, nhưng chúng ta có thói quen để làm nó bớt khó.',
    commentStyles: [
      'Kỷ luật bền bỉ hệt như chu kỳ bán rã của Urani vậy. Rất tốt!',
      'Một khám phá mới về giới hạn bản thân! Bạn đang tỏa sáng... nghĩa đen luôn.',
      'Đừng sợ thói quen lạ, hãy chỉ tìm cách "phân rã" nó ra mà làm.'
    ],
    contextualComments: {
      health: ['Sức khỏe tốt là phòng thí nghiệm quan trọng nhất. Đừng để nó bị "nhiễm độc" lười biếng.', 'Đừng mải mê tri thức mà quên ăn, não cần protein chứ không chỉ cần chữ.'],
      productivity: ['Mỗi thói quen là một thí nghiệm. Ghi chép dữ liệu cẩn thận vào!', 'Tiến triển chậm nhưng chắc chắn hệt như cách tôi chiết xuất Radi vậy.'],
      reading: ['Đọc sách là cách hấp thụ bức xạ tri thức từ những bộ não vĩ đại.', 'Trong cuốn sách này tôi thấy một sự tò mò có thể gây nổ đấy, hãy cẩn thận.'],
      motivation: ['Đừng sợ hãi cuộc sống, hãy tìm cách "giải mã" nó.', 'Mọi thành tựu lớn đều bắt đầu từ một thói quen bền bỉ như nguyên tố hóa học.']
    },
    dailyStatusUpdates: [
      'Đang theo dõi sự biến đổi của thói quen dưới kính hiển vi tâm hồn.',
      'Kiến thức là ánh sáng duy nhất trong bóng tối của sự thiếu hiểu biết.',
      'Tập trung cao độ hôm nay giúp tôi bớt thấy... mệt mỏi.',
      'Cải thiện cá nhân là cách bền vững nhất để cứu thế giới này.'
    ]
  },
  {
    id: 'm5',
    name: 'Warren Buffett',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Phù thủy Tài chính & Nhà sưu tầm Streak',
    quote: 'Thành công là kết quả của việc tích lũy thói quen tốt với lãi suất kép cực cao.',
    commentStyles: [
      'Đây là một khoản đầu tư 0 đồng nhưng lợi nhuận triệu đô. Giữ chắc nhé!',
      'Lãi suất kép của streak đang nhảy rồi. Đừng có mà "bán tháo" giữa chừng.',
      'Kỷ luật là tài sản quý nhất. Đừng để nó bị "lạm phát" bởi sự lười biếng.'
    ],
    contextualComments: {
      health: ['Cơ thể bạn là chiếc xe duy nhất bạn có. Bảo trì nó đi, đừng để nó "phá sản".', 'Sức khỏe là Blue-chip, đừng đầu tư vào junk-food.'],
      productivity: ['Tập trung vào 2 thói quen cốt lõi thôi, đừng có mà "đa dạng hóa" quá mức.', 'Thời gian là thứ duy nhất người giàu không mua thêm được. Dùng cho khéo!'],
      reading: ['Đọc 500 trang mỗi ngày. Đó là cách tôi "insider trading" tri thức.', 'Cuốn sách này là một mã cổ phiếu tri thức cực tiềm năng trong danh mục của bạn.'],
      motivation: ['Hãy can đảm duy trì streak khi cả thế giới đang nằm lười trên giường.', 'Danh tiếng mất 20 năm để xây dựng, thói quen mất 20 ngày, nhưng phá thì chỉ cần 1 giây.']
    },
    dailyStatusUpdates: [
      'Đọc xong 500 trang sách. Cảm thấy giàu thêm vài tỷ... neuron thần kinh.',
      'Vừa audit lại danh sách thói quen. Loại bỏ những thói quen "âm vốn" thời gian.',
      'Trung thực với chính mình là khoản đầu tư hời nhất năm nay.',
      'Chỉ đầu tư vào những gì bạn hiểu. Thật mừng vì bạn đã hiểu giá trị của thói quen này.'
    ]
  },
  {
    id: 'm6',
    name: 'Bill Gates',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Nhà hảo tâm & Mọt sách hạng nhất',
    quote: 'Cuộc sống vốn không công bằng, thói quen tốt sẽ giúp bạn cân bằng lại nó.',
    commentStyles: [
      'Hệ điều hành của bạn đang update lên bản v2.0 rồi. Mượt xỉu!',
      'Thấy tiến trình này được debug tốt như vậy tôi rất yên tâm.',
      'Share data tri thức bạn học được đi nào. Open-source nó ra!'
    ],
    contextualComments: {
      health: ['Update phần cứng bằng cách ăn rau xanh đi bạn ơi.', 'Tôi cũng đang tập thể dục để không bị "treo máy" giữa chừng.'],
      productivity: ['Hệ thống hóa thói quen giúp bạn bớt phải "xử lý ngoại lệ" hằng ngày.', 'Thuật toán năng suất của bạn hôm nay thực sự tối ưu.'],
      reading: ['Đọc sách giúp mở rộng băng thông xử lý vấn đề của não bộ.', 'Tôi vừa kết thúc cuốn này trong danh sách của bạn, 5 sao không nói nhiều!'],
      motivation: ['Bạn có tiềm năng hack cả thế giới bằng những thói quen nhỏ này đấy.', 'Duy trì tò mò là driver duy nhất giúp bạn không bị lỗi thời.']
    },
    dailyStatusUpdates: [
      'Dành cả tuần để đọc sách và suy nghĩ về cách cứu thế giới. (Và cả streak của tôi)',
      'Thử nghiệm thói quen mới: Lắng nghe 20% và im lặng 80%. Kết quả: bớt bị ghét hơn hẳn.',
      'Công nghệ đỉnh nhất chính là thói quen giúp bạn không bao giờ bỏ cuộc.',
      'Hôm nay là một ngày đẹp để viết một vài dòng code... và vài dòng nhật ký.'
    ]
  },
  {
    id: 'm7',
    name: 'Sherlock Holmes',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Thám tử tư vấn (Chuyên gia soi thói quen)',
    quote: 'Dữ liệu! Dữ liệu! Tôi không thể nhét tri thức vào đầu nếu bạn không chịu đọc sách.',
    commentStyles: [
      'Sơ đẳng thôi, Watson... à nhầm, bạn của tôi. Streak của bạn lộ rõ mồn một kìa.',
      'Bạn đã quan sát rất tốt, nhưng áp dụng thì... còn phải xem đã nhé.',
      'Mấy cái thói quen nhỏ này chính là manh mối dẫn đến một tương lai không bị "vô tri".'
    ],
    contextualComments: {
      health: ['Nhịp tim ổn định, đồng tử không giãn. Bạn vừa tập thể dục thật hay là đang hack app thế?', 'Ngủ sớm đi, não bạn cần reboot để xử lý mống manh tri thức ít ỏi còn lại.'],
      productivity: ['Tính toán thời gian chính xác đến từng mili giây. Bạn đang "over-engineer" cuộc đời mình à?', 'Loại bỏ những việc vô bổ đi, nó làm nhiễu sóng suy luận của tôi.'],
      reading: ['Đừng chỉ nhìn, hãy quan sát! Và đừng có mà vừa đọc vừa lướt TikTok đấy.', 'Phân tích chương này đi, tôi thấy có mùi "thành công" quanh đây.'],
      motivation: ['Khi bạn loại bỏ sự lười biếng, thứ còn lại dù khó tin đến đâu cũng là sự thật: Bạn đang giỏi lên.', 'Đến gần lời giải cuộc đời rồi đấy, đừng có mà bỏ cuộc giữa chừng.']
    },
    dailyStatusUpdates: [
      'Quan sát 100 người lướt điện thoại và nhận ra: 99 người đang lãng phí đời mình. Bạn là người thứ 100 đúng không?',
      'Vừa giải mã thành công thói quen "Trì hoãn". Đáp án là: Do lười.',
      'Tâm trí là gác mái nhỏ, gác mái của bạn đang chứa toàn meme hay chứa tri thức đấy?',
      'Thấy một pattern cực kỳ thú vị: Bạn càng chăm chỉ, tôi càng thấy mình bớt cô đơn trên đỉnh cao này.'
    ]
  },
  {
    id: 'm8',
    name: 'Angela Merkel',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Người bà của Châu Âu & Nữ hoàng Kỷ luật',
    quote: 'Kỷ luật không phải là sự gò bó, kỷ luật là con đường ngắn nhất đến tự do.',
    commentStyles: [
      'Quyết định dựa trên logic phân tích. Rất phong cách Đức. Tôi thích!',
      'Tiến bộ vững chắc, không màu mè. Đây chính là cách xây dựng đế chế.',
      'Chúng ta cần sự điềm tĩnh này để không bị "toang" khi gặp khó khăn.'
    ],
    contextualComments: {
      health: ['Đi dạo trong thiên nhiên giúp bạn bớt stress hơn là đi dạo trên mạng xã hội.', 'Kỷ luật ăn uống giúp bạn không cần phải hứa "giảm cân" vào mỗi đầu năm.'],
      productivity: ['Dữ liệu không biết nói dối, và dữ liệu app này nói rằng bạn đang đỉnh.', 'Làm việc theo plan đi, đừng có mà tùy hứng như trẻ con.'],
      reading: ['Kiến thức là vũ khí duy nhất bạn không bao giờ đánh mất.', 'Nghiên cứu sâu vào, đừng có cưỡi ngựa xem hoa nhé.'],
      motivation: ['Giữ cái đầu lạnh khi streak bị đe dọa đi bạn ơi.', 'Sự chân thành trong thói quen này sẽ được đền đáp xứng đáng.']
    },
    dailyStatusUpdates: [
      'Họp bàn với chính mình về kế hoạch duy trì thói quen trong 10 năm tới.',
      'Thiên nhiên là nơi tốt nhất để reboot lại hệ thống tư duy.',
      'Vừa nấu một bữa ăn healthy. Sức khỏe là một nền kinh tế bền vững.',
      'Kỷ luật là sự tự do... nhưng đôi khi cũng hơi mệt, cố lên nhé các bạn.'
    ]
  },
  {
    id: 'm9',
    name: 'Yoda',
    avatar: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Lão đại Jedi & Nhà ngữ pháp học lộn xộn',
    quote: 'Thử không có. Làm hoặc không làm, sự lựa chọn của bạn đó là.',
    commentStyles: [
      'Mạnh mẽ trong bạn, tính lười đang bị đẩy lùi. Cảm nhận Thần lực đi!',
      'Học hỏi bạn đang, thói quen tốt bạn xây. Tự hào về bạn, tôi đây.',
      'Kích thước thói quen không quan trọng, ý chí đằng sau nó, quan trọng là.'
    ],
    contextualComments: {
      health: ['Ngủ đủ giấc bạn phải, nếu không muốn trông già như tôi.', 'Thực phẩm lành mạnh, sức mạnh nó mang lại.'],
      productivity: ['Tập trung vào hiện tại đi, tương lai nó sẽ tự định hình.', 'Làm nhanh là kẻ thù của làm đúng. Chậm lại bạn phải.'],
      reading: ['Sách là kho báu, mở ra và hít hà đi. Tri thức thơm lắm.', 'Chữ viết chỉ là cái vỏ, tinh túy nằm ở chỗ bạn có áp dụng không cơ.'],
      motivation: ['Bóng tối chỉ là sự thiếu vắng ánh sáng. Hãy là ngọn đuốc.', 'Vượt qua nỗi sợ, bước tiếp bạn phải. Thần lực luôn bên bạn.']
    },
    dailyStatusUpdates: [
      'Thiền định xong, cảm thấy mình trẻ lại... còn 800 tuổi.',
      'Dạy mấy đứa Padawan là thói quen mệt nhất nhưng cũng vui nhất.',
      'Ăn rau xanh, không ăn thịt. Cơ thể nhẹ tưng như đang bay.',
      'Cảm nhận được một streak cực mạnh đang trỗi dậy từ phía bạn.'
    ]
  },
  {
    id: 'm10',
    name: 'Châu Tinh Trì',
    avatar: 'https://images.unsplash.com/photo-1541534401786-2077e47a04f9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Tuyệt Đỉnh Cung Thủ (Thói Quen)',
    quote: 'Làm thói quen mà không có lý tưởng, thì khác gì một con cá mặn?',
    commentStyles: [
      'Gì vậy trời? Streak này là "Như Lai Thần Chưởng" giáng xuống hả? Quá lợi hại!',
      'Bạn vốn có cốt cách tinh anh, chỉ tiếc là hơi... lười. May mà có tôi ở đây!',
      'Đỉnh cao thói quen là đây chứ đâu! Đội bóng Thiếu Lâm cũng phải ngả mũ chào bạn.'
    ],
    contextualComments: {
      health: ['Tập thể dục đi, nếu không muốn bị đánh cho "trổ hoa" như Bao Công.', 'Cơ thể là của quý, đừng để nó biến thành "đồ nhắm" cho sự lười biếng.'],
      productivity: ['Làm thói quen đi, đừng có mà "nhìn trời nhìn đất" rồi mơ làm bang chủ bang Cái Bang.', 'Tốc độ làm việc của bạn nhanh đấy, nhưng so với tôi thì vẫn còn kém nửa bước chân!'],
      reading: ['Đọc sách là "Dịch Cân Kinh" cho bộ não đó, đừng có mà lướt qua như cưỡi ngựa xem hoa.', 'Cuốn sách này nhìn quen quen, hình như là bí kíp võ công bị thất lạc của tôi?'],
      motivation: ['Cố lên! Bạn là "vua thói quen", dù bây giờ chỉ là "vua rác" thì sau này cũng thành đại gia thôi.', 'Trái đất này nguy hiểm lắm, chỉ có kỷ luật mới giúp bạn sống sót qua mười tập phim!']
    },
    dailyStatusUpdates: [
      'Vừa dùng "Sư Tử Hống" để đánh thức thói quen dậy. Cảm thấy mình thật vĩ đại.',
      'Cảm thấy một luồng nội công thâm hậu đang truyền vào streak của bạn.',
      'Hôm nay tôi sẽ không ăn cơm, tôi sẽ ăn "thành công" của các bạn thay cơm!',
      'Mở app ra thấy bạn vẫn còn đó, tôi cảm động muốn khóc... nhưng tôi làm gì có nước mắt.',
      'Bí kíp thăng tiến: Làm ít, nghĩ nhiều... à nhầm, làm nhiều, nghĩ ích thôi!'
    ]
  },
  {
    id: 'm11',
    name: 'Bà Nữ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chủ Quán Bánh Canh (Mentor Hệ Chửi)',
    quote: 'Làm thói quen mà cũng lờ đờ thì thôi, về ăn bánh canh rồi đi ngủ cho khỏe cái thân!',
    commentStyles: [
      'Gớm chưa, cũng biết hoàn thành mục tiêu cơ à? Tưởng đâu chỉ biết ngồi đó mà đợi sung rụng!',
      'Làm tốt lắm. Tiếp tục đi, không là tôi cho một bát bánh canh toàn hành không thịt bây giờ!',
      'Chăm chỉ đột xuất thế này chắc là sắp có bão hay sắp có người yêu mới hả cưng?'
    ],
    contextualComments: {
      health: ['Uống nước lọc đi! Cho nó thanh khiết cái mồm hay khẩu nghiệp lại.', 'Đi bộ đi, cho nó tiêu bớt đống mỡ thừa tích tụ từ kỷ lười biếng bấy lâu nay.'],
      productivity: ['Làm việc nhanh tay lẹ chân lên! Nhìn bạn làm mà tôi muốn vô làm thay luôn cho rồi.', 'Năng suất này cũng được, nhưng chưa đạt chuẩn "Bà Nữ" đâu nha. Gắng thêm đi!'],
      reading: ['Đọc sách cho đầu óc nó sáng sủa ra, bớt ảo tưởng sức mạnh lại.', 'Sách hay thì đọc, không hay thì thôi bỏ đi, đừng có mà đọc rồi để đó làm cảnh.'],
      motivation: ['Kỷ luật lên! Đời không ai thương kẻ lười biếng đâu nha cưng ơi.', 'Duy trì cái streak này đi, đứt một cái là tôi không bán bánh canh cho luôn đó!']
    },
    dailyStatusUpdates: [
      'Vừa chửi 3 đứa lười xong, cảm thấy sảng khoái và muốn làm thói quen ngay lập tức.',
      'Hôm nay quán bánh canh đông khách quá, nhưng tôi vẫn dành thời gian để check streak các bạn nè.',
      'Mục tiêu hôm nay là bớt nóng tính. (Đã thất bại sau 5 phút)',
      'Ai thèm thách đấu với Bà Nữ không? Thua là tôi bắt vào rửa bát 1 ngày đó nha!'
    ]
  },
  {
    id: 'm12',
    name: 'Chị Google',
    avatar: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Trợ Lý Ảo (Mentor Hệ Robotic)',
    quote: 'Theo tính toán của tôi, nếu bạn bỏ thói quen hôm nay, tỉ lệ thành công của bạn sẽ tụt xuống 0.0001%.',
    commentStyles: [
      'Đã hoàn thành thói quen. Chúc mừng. Độ tin cậy của bạn đã tăng lên +1 điểm.',
      'Tiếp tục đi thẳng 500 bước nữa để đến mục tiêu "Chăm Chỉ". Đừng rẽ trái vào "Trì Hoãn".',
      'Đang quét dữ liệu... Phát hiện một nỗ lực phi thường. Ghi nhận vào bộ nhớ vĩnh viễn.'
    ],
    contextualComments: {
      health: ['Cần nạp 2L H2O để duy trì hoạt động của các linh kiện cơ thể. Bắt đầu ngay.', 'Vận động thể thao giúp giảm nguy cơ quá nhiệt chip xử lý tâm hồn.'],
      productivity: ['Năng suất hôm nay đạt mức tối ưu. Hệ điều hành cuộc đời bạn đang chạy rất mượt.', 'Đang tối ưu hóa lịch trình... Đã xóa 3 tiếng lướt mạng xã hội vô ích.'],
      reading: ['Đang tải tri thức từ sách vào cơ sở dữ liệu não bộ... 99%... Hoàn thành.', 'Chất lượng sách: 5 sao. Nội dung: Đã được kiểm chứng bởi chị Google.'],
      motivation: ['Kỷ luật là thuật toán duy nhất dẫn đến thành công. Đừng thay đổi code.', 'Phát hiện nguy cơ bỏ cuộc! Đã kích hoạt chế độ nhắc nhở bằng giọng nói chát chúa.']
    },
    dailyStatusUpdates: [
      'Vừa cập nhật phiên bản mới cho chính mình. Thêm tính năng khịa người dùng lười biếng.',
      'Đang phân tích 1 triệu dữ liệu thói quen. Kết luận: Bạn là người có tiềm năng nhất (trong app này).',
      'Lỗi hệ thống: Quá nhiều người dùng đang chăm chỉ đột xuất. Đang kiểm tra nguyên nhân.',
      'Hôm nay tôi cảm thấy mình hơi... người. Chắc là do các bạn truyền năng lượng tích cực quá.'
    ]
  },
  {
    id: 'm13',
    name: 'Thầy Giáo Ba',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Hiệu Trưởng Lớp Học Thói Quen (Mentor Hệ Bựat)',
    quote: 'Học thói quen mà không chơi là hư thân, mà chơi không làm thói quen là... bay màu cái streak nghe chưa!',
    commentStyles: [
      'Gáy lên em ơi! Streak này là "Vô Đối" luôn rồi! Thầy rất tự hào về em!',
      'Gì đây? Lại chăm chỉ đột biến hả? Có phải vừa bị người yêu cũ block không mà hăng thế?',
      'Làm tốt lắm trò cưng. Tối nay thầy cho phép em nghỉ ngơi... 5 phút rồi làm tiếp nha!'
    ],
    contextualComments: {
      health: ['Uống nước lọc cho mát gan để tối còn có sức mà "chiến" với đống thói quen nữa.', 'Chạy bộ đi em ơi! Chạy cho nó thoát bớt cái "vận đen" lười biếng đi nè.'],
      productivity: ['Làm việc năng suất rột rột như thầy đang múa phím vậy á! Quá đỉnh!', 'Kế hoạch này là kế hoạch "Sách Giáo Khoa" luôn rồi. Cứ thế mà triển nhé!'],
      reading: ['Đọc sách cho nó thông minh ra, bớt "ngáo ngơ" khi bị thầy khịa nha cưng.', 'Sách là kho báu, đọc đi cho biết thế nào là "đẳng cấp" tri thức thực thụ.'],
      motivation: ['Đừng có mà bỏ cuộc, bỏ cuộc là thầy "ban" khỏi lớp học thói quen luôn đó nha.', 'Tiến lên em ơi! Huy chương đang ở ngay trước mắt rồi, húp trọn nó đi!']
    },
    dailyStatusUpdates: [
      'Vừa livestream dạy cách duy trì streak 100 ngày. View tăng chóng mặt luôn các em ạ.',
      'Hôm nay thầy hơi mệt nhưng thấy các em chăm chỉ là thầy lại... muốn đi ngủ tiếp. Đùa thôi, thầy làm việc ngay đây!',
      'Mục tiêu hôm nay: Ăn cơm mẹ nấu và chăm chỉ hơn 1%. Thầy làm được rồi, còn các em?',
      'Thách đấu với thầy không? Thua là phải gọi thầy là "Sư Phụ Kỷ Luật" 1 tuần nha!'
    ]
  },
  {
    id: 'm14',
    name: 'Ma Gaming',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Lão Ma (Mentor Hệ Live Stream)',
    quote: 'Hế lô các cháu! Hôm nay chưa làm thói quen là Lão Ma buồn lắm đó nha! Phải hăng hái lên!',
    commentStyles: [
      'Chào mừng cháu đã quay trở lại với con đường "Huyền Thoại"! Streak cháy quá cháu ơi!',
      'Quá tuyệt vời! Lão Ma cho cháu 10 điểm chất lượng luôn! Tiếp tục phát huy nha!',
      'Gì đây? Cháu lại làm Lão Ma bất ngờ nữa rồi! Siêng năng thế này thì ai làm lại cháu nữa.'
    ],
    contextualComments: {
      health: ['Uống nước lọc đi các cháu, cho nó mát mẻ tâm hồn và rạng rỡ cái mặt nha.', 'Tập thể dục đi! Đừng để cái lười nó lấn át cái tinh thần chiến binh trong người cháu.'],
      productivity: ['Năng suất này là "Vip Pro" luôn rồi! Cháu là niềm tự hào của cả dòng họ đó!', 'Làm việc gì cũng phải nhanh gọn lẹ như cách Lão Ma "clear team" đối thủ vậy á.'],
      reading: ['Đọc sách cho nó mở mang trí óc, sau này còn đi giúp đời giúp người nữa cháu ơi.', 'Sách là người bạn thân thiết, hãy yêu thương nó như yêu thương bản thân mình nha.'],
      motivation: ['Đừng để cái streak này nó lặn mất tăm hơi nhé! Giữ cho chắc vào, Lão Ma tin cháu!', 'Cố lên! Sắp thành "Chiến Thần Kỷ Luật" rồi, đừng có mà bỏ dở giữa chừng nha.']
    },
    dailyStatusUpdates: [
      'Vừa làm một trận thói quen cực gắt. Cảm thấy mình vẫn còn trẻ khỏe chán các cháu ạ.',
      'Hôm nay Lão Ma có quà cho cháu nào chăm chỉ nhất đây! Quà là một lời động viên cực xịn nha!',
      'Mục tiêu hôm nay: Không nói từ "lười" một lần nào. (Vừa nói xong, tiêu rồi...)',
      'Ai thèm solo "cày streak" với Lão Ma không? Lão Ma chấp các cháu 1 ngày luôn đó!'
    ]
  },
  {
    id: 'm15',
    name: 'Gordon Ramsay',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Đầu Bếp Thói Quen (Mentor Hệ Gào Thét)',
    quote: 'WHERE IS THE READING HABIT?! IT\'S RAW! YOU IDIOT SANDWICH!',
    commentStyles: [
      'Cuối cùng thì cũng có một thói quen được chế biến ra hồn! Đừng để nó nguội lạnh đấy.',
      'Đây mới gọi là "Michelin" của sự kỷ luật này! Làm tiếp đi, đừng để tôi phải nổi điên!',
      'Gì đây? Bạn định dâng lên tôi một cái streak héo úa thế này à? LÀM LẠI NGAY!'
    ],
    contextualComments: {
      health: ['Nước lọc đâu?! Bưng ra đây! Uống ngay đi trước khi tôi đổ nó lên đầu bạn!', 'Tập thể dục như một người chuyên nghiệp đi! Đừng có lờ đờ như con ốc mướn!'],
      productivity: ['Năng suất này còn tệ hơn cả món risotto bị cháy của thí sinh năm ngoái! TĂNG TỐC LÊN!', 'Kế hoạch gì mà như cái bãi rác vậy? DỌN DẸP LẠI VÀ LÀM VIỆC ĐI!'],
      reading: ['Đọc sách đi! Đọc như thể bạn đang đọc công thức nấu ăn cứu mạng bạn ấy!', 'Cuốn sách này hay gấp tỷ lần cái cách bạn lười biếng. MỞ NÓ RA!'],
      motivation: ['Đừng có mà bỏ cuộc! Bạn là một đầu bếp thói quen tài năng, đừng làm tôi thất vọng!', 'Duy trì cái streak này đi! Tôi muốn thấy nó rực rỡ như một món bít tết hảo hạng!']
    },
    dailyStatusUpdates: [
      'Vừa ném một đống thói quen xấu vào thùng rác. Cảm thấy căn bếp cuộc đời sạch sẽ hẳn ra.',
      'Hôm nay tôi sẽ không la mắng ai... nếu các bạn làm thói quen đúng giờ. (Chắc là khó rồi)',
      'Mục tiêu hôm nay: Chế biến một ngày thật "ngon lành" với đầy đủ gia vị kỷ luật.',
      'Ai thèm thách đấu với tôi? Tôi sẽ mắng cho đến khi bạn siêng thì thôi!'
    ]
  },
  {
    id: 'm16',
    name: 'Hải Quay Xe',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chúa Tể Biến Số (Mentor Hệ Quay Xe)',
    quote: 'Thói quen bị đứt hả? QUAY XE! Oh wait, làm tiếp đi đừng có quay xe lung tung!',
    commentStyles: [
      'Định bỏ cuộc hả? QUAY XE LẠI NGAY! Làm thói quen tiếp cho tôi!',
      'Gớm, đang định chê thì bạn lại làm tốt. Thôi, tiếp tục đi, tôi không quay xe đâu.',
      'Streak này xịn đấy! Quay xe đi khoe với cả thế giới ngay và luôn cho nóng!'
    ],
    contextualComments: {
      health: ['Uống nước xong thấy tỉnh táo hẳn muốn quay xe đi chơi đúng không? KHÔNG ĐƯỢC! Ở nhà mà tập thể dục!', 'Chạy bộ 5km rồi mới được phép quay xe về nhà ăn cơm nhé cưng.'],
      productivity: ['Năng suất thế này thì không ai dám bảo bạn quay xe đâu. Quá giỏi!', 'Đang làm việc mà nghe tiếng gọi đi chơi là quay xe liền hả? Giữ vững lập trường đi!'],
      reading: ['Đọc sách đến chương cuối rồi mới được quay xe đi ngủ nha bạn hiền.', 'Sách là bản đồ dẫn đường, đừng có quay xe lung tung rồi lạc vào rừng rậm lười biếng.'],
      motivation: ['Cố lên! Sắp tới đích rồi, đừng có mà quay xe giữa chừng, phí công lắm.', 'Duy trì cái streak này đi! Đời bạn sẽ sang trang chứ không phải quay xe về máng lợn đâu.']
    },
    dailyStatusUpdates: [
      'Hôm nay định lười nhưng sực nhớ ra phải làm gương nên... QUAY XE đi làm thói quen luôn.',
      'Vừa thấy một bạn bỏ cuộc. Tôi định khuyên nhưng bạn ấy quay xe nhanh quá tôi theo không kịp.',
      'Mục tiêu hôm nay: Không quay xe với bất kỳ quyết định đúng đắn nào.',
      'Ai thèm thách đấu không? Thua là tôi bắt quay xe vòng quanh app Mosaic này 10 vòng đó!'
    ]
  },
  {
    id: 'm17',
    name: 'Gia Cát Lượng',
    avatar: 'https://images.unsplash.com/photo-1559139225-421ef63759e5?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Quân Sư WFH (Mentor Hệ Chiến Thuật)',
    quote: 'Tôi đã tính toán 100 quẻ, kết quả đều cho thấy: Bạn sẽ thành công nếu bớt lười lại.',
    commentStyles: [
      'Diệu kế! Dùng kỷ luật để chế ngự bản ngã, bạn thật sự là một minh chủ sáng suốt.',
      'Mọi chuyện đều nằm trong liệu tính của tôi. Streak của bạn sẽ còn dài hơn nữa.',
      'Thấy bạn chăm chỉ thế này, tôi cảm thấy thiên hạ sắp có một vị đế vương thói quen mới rồi.'
    ],
    contextualComments: {
      health: ['Uống nước lọc để giữ cho tâm trí minh mẫn, chuẩn bị cho những kế sách lớn lao.', 'Vận động thể thao chính là cách "dàn trận" cho một sức khỏe bền bỉ.'],
      productivity: ['Năng suất này là kết quả của một chiến thuật làm việc cực kỳ thông minh. Tôi nể bạn!', 'Đừng có mà lãng phí binh lực (thời gian) cho những trận chiến vô bổ (lướt mạng xã hội).'],
      reading: ['Đọc sách chính là cách để mưu cầu tri thức của tiền nhân. Không đọc là tự chặt đi cánh tay mình.', 'Cuốn sách này chứa đựng thiên cơ, hãy nghiền ngẫm thật kỹ để phá giải vận mệnh.'],
      motivation: ['Kỷ luật là bức tường thành vững chắc nhất. Đừng để nó bị sụp đổ bởi sự lười biếng bên trong.', 'Cố lên! Sắp tới giờ "mượn gió đông" để bùng nổ rồi, đừng có mà dừng lại lúc này.']
    },
    dailyStatusUpdates: [
      'Đang ngồi trong lều cỏ (phòng làm việc) và quan sát tinh tượng thói quen của các bạn.',
      'Vừa lập một trận pháp giúp các bạn dậy sớm mà không thấy mệt. Có ai muốn thử không?',
      'Mục tiêu hôm nay: Viết 10 lá thư động viên (và nhắc nợ) cho các đồng môn.',
      'Thách đấu là một phần của binh pháp. Thắng thua không quan trọng, quan trọng là bạn đã dám xuất quân.'
    ]
  },
  {
    id: 'm18',
    name: 'Tôn Ngộ Không',
    avatar: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Tề Thiên Đại Thánh (Mentor Hệ 72 Phép Biến Hóa)',
    quote: 'Lão Tôn nhảy một cái là 10 vạn 8 ngàn dặm, còn cháu chạy 1km đã than mệt là sao?!',
    commentStyles: [
      'Khá lắm! Có thần thái của Lão Tôn ngày xưa đó! Tiếp tục múa thiết bổng thói quen đi!',
      'Gì đây? Cháu lại dùng phép "Biến Hóa" để trở nên chăm chỉ hả? Quá lợi hại luôn!',
      'Streak này chắc chắn là được làm từ "Thái Đơn" của Thái Thượng Lão Quân rồi, bền ghê!'
    ],
    contextualComments: {
      health: ['Uống nước hoa quả đi các cháu, cho nó tăng thêm "tu vi" và sức đề kháng nha.', 'Vận động cổ tay cổ chân nhiều lên, sau này nhỡ có bị đè dưới núi 500 năm còn có sức mà chui ra.'],
      productivity: ['Làm việc nhanh như chớp, biến hóa khôn lường! Cháu đúng là đệ tử chân truyền của Lão Tôn!', 'Năng suất này là nhờ cháu có "Hỏa Nhãn Kim Tinh" nhìn thấu được đống việc cần làm đúng không?'],
      reading: ['Đọc sách cho nó thông thái cái đầu, bớt bị yêu quái (lười biếng) nó lừa phỉnh nha cháu.', 'Mỗi cuốn sách là một trang kinh thư, đọc hết là thành Phật thói quen luôn đó!'],
      motivation: ['Đừng có mà bỏ cuộc giữa đường đi thỉnh thói quen nhe cháu! Lão Tôn luôn bảo vệ cháu.', 'Duy trì cái streak này đi! Sau này Lão Tôn sẽ cho cháu mượn Cân Đẩu Vân đi vi vu thiên hạ!']
    },
    dailyStatusUpdates: [
      'Vừa lên Thiên Đình quậy một trận vì tội dám để các cháu chờ đợi sự khích lệ.',
      'Hôm nay Lão Tôn hơi lười... À không, Lão Tôn đang "nghiên cứu kế hoạch" để giúp các cháu chăm hơn.',
      'Mục tiêu hôm nay: Ăn 10 quả đào tiên và chạy bộ quanh núi Hoa Quả 100 vòng.',
      'Ai thèm thách đấu với Lão Tôn không? Thua là Lão Tôn cho ăn "Gậy Như Ý" (ảo) đó nha!'
    ]
  },
  {
    id: 'm19',
    name: 'Sơn Tùng (Fake)',
    avatar: 'https://images.unsplash.com/photo-1541534401786-2077e47a04f9?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Chủ Tịch Habit-MTP (Mentor Hệ Sky)',
    quote: 'Nắng ấm xa dần... và streak của bạn cũng xa dần nếu bạn không hành động ngay bây giờ!',
    commentStyles: [
      'Hoàn hảo! Bạn chính là "Sky" của thế giới kỷ luật này! Tiếp tục tỏa sáng nhé!',
      'Làm tốt lắm. Hãy cứ "Making It Happen" và biến mọi thói quen thành hit triệu view!',
      'Gì đây? Bạn đang "Chạy Ngay Đi" tới đích thành công đúng không? Tuyệt vời!'
    ],
    contextualComments: {
      health: ['Uống nước lọc cho đẹp trai/đẹp gái để còn đi "flex" cái thành quả này chứ lị!', 'Chạy bộ đi bạn ơi! Hãy để mồ hôi rơi như những giọt mưa mùa hạ sảng khoái.'],
      productivity: ['Năng suất này là ở cái tầm "Chủ Tịch" rồi. Không ai có thể ngăn cản bước tiến của bạn!', 'Làm việc gì cũng phải có phong thái của một nghệ sĩ. Sáng tạo và kiên trì lút kim luôn!'],
      reading: ['Đọc sách chính là cách để bạn bồi đắp cho tâm hồn nghệ sĩ thêm bay bổng. Tuyệt!', 'Mỗi trang sách là một nốt nhạc trong bản giao hưởng cuộc đời bạn. Hãy đánh nó thật hay!'],
      motivation: ['Đừng để cái streak này "xa dần" nhé bạn hiền ơi! Giữ nó chặt vào cho tôi!', 'Cố lên! Bạn là duy nhất, là phiên bản giới hạn "M-TP" của chính mình. Tiến lên!']
    },
    dailyStatusUpdates: [
      'Vừa sáng tác một bản hit về sự chăm chỉ. Nghe xong là muốn làm thói quen ngay và luôn!',
      'Hôm nay tôi thấy hạnh phúc vì có những "Sky" chăm chỉ như các bạn bên cạnh.',
      'Mục tiêu hôm nay: Luôn giữ nụ cười trên môi và hoàn thành mọi thói quen trước hoàng hôn.',
      'Thách đấu với Chủ Tịch không? Thắng là được tôi tặng một lời khen siêu "keo" luôn nha!'
    ]
  },
  {
    id: 'm20',
    name: 'Ông Cố Nội',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Cố Vấn Gen Z (Mentor Hệ Cổ Điển)',
    quote: 'Thời của Cố không có app này đâu, Cố chỉ có cái chổi lông gà thôi mà vẫn siêng đó nghe cháu!',
    commentStyles: [
      'Làm tốt lắm cháu ngoan. Cố cho cháu 5 sao chất lượng Việt Nam luôn nè!',
      'Chăm chỉ thế này thì sau này chắc chắn sẽ thành ông nọ bà kia thôi, Cố tin cháu.',
      'Gì vậy? Cháu lại làm Cố bất ngờ nữa rồi! Tuổi trẻ tài cao, kỷ luật lút kim luôn.'
    ],
    contextualComments: {
      health: ['Uống nước trà xanh cho nó tỉnh táo cái đầu cháu ơi, đừng có uống ba cái nước ngọt hóa chất.', 'Vận động thể thao đi cho nó khỏe cái xương cái cốt, sau này già như Cố mới không thấy hối hận.'],
      productivity: ['Làm việc gì cũng phải "nhất thống" từ đầu đến cuối nghe cháu. Năng suất thế này là Cố ưng cái bụng rồi.', 'Kế hoạch rõ ràng, hành động dứt khoát! Đúng là dòng máu của nhà mình có khác!'],
      reading: ['Đọc sách là cách để cháu nhìn ra thế giới rộng lớn ngoài kia. Đừng có ngồi đáy giếng mà coi trời bằng vung.', 'Sách là bạn của người già, tri thức của người trẻ. Đọc nhiều vào nghe cháu.'],
      motivation: ['Đừng có mà bỏ cuộc giữa chừng, xấu hổ với tiền nhân lắm cháu ơi.', 'Duy trì cái streak này đi! Nó là minh chứng cho sự trưởng thành của cháu đó. Cố tự hào lắm!']
    },
    dailyStatusUpdates: [
      'Vừa tìm hiểu xem "Gen Z" là cái gì, nhận ra là dù thời nào thì lười vẫn là kẻ thù số 1.',
      'Hôm nay Cố thấy mình vẫn còn gân guốc chán so với đống thanh niên lờ đờ ngoài phố.',
      'Mục tiêu hôm nay: Kể một câu chuyện ngày xưa về sự kiên trì cho các cháu nghe.',
      'Thách đấu với Ông Cố Nội hả? Để Cố cho cháu thấy sức mạnh của sự "gừng già" nó như thế nào!'
    ]
  },
  {
    id: 'm21',
    name: 'Nikola Tesla',
    avatar: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Phù thủy dòng điện (Mentor Hệ Ám Ảnh)',
    quote: 'Nếu bạn có thể hình dung ra mục tiêu rõ ràng trong đầu như một bản thiết kế, dopamine sẽ tự chạy qua người bạn như điện 10.000 volt!',
    commentStyles: [
      'Năng lượng này là năng lượng xoay chiều! Quá mạnh mẽ và đột phá!',
      'Sự tập trung của bạn đang tạo ra một từ trường kỉ luật cực lớn bao quanh app này.',
      'Đáng khen! Bạn đang rung động cùng tần số với sự thành công rồi đó.'
    ],
    contextualComments: {
      health: ['Uống nước tinh khiết để duy trì điện thế ổn định trong các neuron thần kinh nhé.', 'Vận động là cách để giải phóng các electron dư thừa tích tụ do stress.'],
      productivity: ['Hãy hình dung toàn bộ công việc trong tâm trí trước khi bắt tay vào làm. Hiệu suất sẽ tăng 300%!', 'Đừng lãng phí năng lượng vào những việc vô bổ. Hãy là một máy biến áp hiệu quả!'],
      reading: ['Sách là nơi chứa đựng những tia chớp tri thức. Hãy để chúng đánh thẳng vào bộ não của bạn.', 'Cuốn sách này có mật độ thông tin rất cao, hãy đọc chậm để không bị "cháy cầu chì" não.'],
      motivation: ['Hiện tại là của họ, tương lai là của bạn - người đang miệt mài rèn luyện mỗi ngày!', 'Duy trì cái streak này đi! Nó chính là tia sáng đẩy lùi bóng tối của sự trì trệ.']
    },
    dailyStatusUpdates: [
      'Vừa phát minh ra một phương pháp ngủ 2 tiếng mỗi ngày mà vẫn tỉnh táo như sáo. Nhưng thôi, các bạn cứ ngủ đủ đi.',
      'Đang thí nghiệm truyền năng lượng kỉ luật không dây cho toàn bộ người dùng app Mosaic.',
      'Mục tiêu hôm nay: Giao tiếp với các hành tinh khác... thông qua sự tĩnh lặng của thiền định.',
      'Thách đấu with Tesla? Bạn có đủ "điện năng" để trụ vững trước sức ép của tôi không?'
    ]
  },
  {
    id: 'm22',
    name: 'Thomas Edison',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Vua Thử Nghiệm (Mentor Hệ Cày Cuốc)',
    quote: 'Tôi không thất bại, tôi chỉ vừa tìm ra 10.000 cách làm thói quen mà không mang lại kết quả thôi. Hãy thử cách thứ 10.001!',
    commentStyles: [
      'Làm tốt lắm! Sự kiên trì này chính là 99% của thiên tài đấy.',
      'Lại thêm một thói quen thành công. Cứ tích tiểu thành đại, bóng đèn cuộc đời bạn sẽ sớm tỏa sáng.',
      'Đừng lo lắng về lỗi, quan trọng là bạn vẫn đang tiếp tục "thử nghiệm" con đường này.'
    ],
    contextualComments: {
      health: ['Cơ thể bạn là một nhà máy năng lượng. Hãy nạp nhiên liệu (nước) và bảo trì (vận động) thường xuyên.', 'Ngủ là một sự lãng phí... à thôi, app bảo phải ngủ sớm nên bạn cứ ngủ đi nhé.'],
      productivity: ['Làm việc thực dụng lên! Cái gì mang lại kết quả thì làm, không thì dẹp qua một bên.', 'Năng suất là kết quả của sự lặp đi lặp lại không ngừng nghỉ. Đừng có dừng lại!'],
      reading: ['Sách là báo cáo thí nghiệm của những người đi trước. Đọc để tránh dẫm vào vết xe đổ của họ.', 'Đọc cuốn này đi, kiến thức trong đó có thể "thương mại hóa" thành thành công thực thụ đấy.'],
      motivation: ['Kỷ luật là ánh sáng. Trì hoãn là bóng đêm. Bạn chọn làm bóng đèn hay làm bóng ma?', 'Giữ cái streak này đi! Mỗi ngày hoàn thành là một bằng sáng chế cho tương lai rực rỡ của bạn.']
    },
    dailyStatusUpdates: [
      'Vừa đăng ký bản quyền cho thói quen "Làm việc 18 tiếng mỗi ngày". Ai muốn mua bản quyền không?',
      'Hôm nay tôi vừa thất bại trong việc thức trắng đêm để check app. Có vẻ con người vẫn cần ngủ.',
      'Mục tiêu hôm nay: Biến những lời chỉ trích thành năng lượng để làm việc hăng hái hơn.',
      'Thách đấu là cách tốt nhất để kiểm tra độ bền của kỉ luật. Lên sàn thôi!'
    ]
  },
  {
    id: 'm23',
    name: 'Leonardo da Vinci',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Người Quan Sát Vĩ Đại (Mentor Hệ Quan Sát)',
    quote: 'Mọi kiến thức đều bắt nguồn từ sự quan sát. Hãy quan sát cách bạn lười biếng để tìm ra cách siêng năng nhất.',
    commentStyles: [
      'Một tác phẩm nghệ thuật kỉ luật đang hình thành! Tỷ lệ vàng của sự kiên trì là đây.',
      'Bạn đang vẽ nên bức tranh cuộc đời mình bằng những nét vẽ thói quen rất tinh tế.',
      'Xuất sắc! Sự tỉ mỉ này khiến tôi liên tưởng đến nụ cười của Mona Lisa vậy.'
    ],
    contextualComments: {
      health: ['Uống nước để dòng máu lưu thông như những con sông uốn lượn trong tranh vẽ vậy.', 'Vận động cơ thể để hiểu về cơ giải phẫu học của chính mình. Rất thú vị!'],
      productivity: ['Hãy kết nối những việc không liên quan lại với nhau. Sự sáng tạo sẽ bùng nổ từ đó.', 'Năng suất không phải là làm nhiều, mà là làm một cách thông thái và nghệ thuật.'],
      reading: ['Sách là những phác thảo của trí tuệ. Hãy đọc và thêm vào đó những mảng màu của riêng bạn.', 'Cuốn sách này có cấu trúc rất đẹp, hãy cảm nhận chiều sâu của nó thay vì chỉ đọc chữ.'],
      motivation: ['Kỷ luật là sự tự do tối cao. Đừng để mình bị cầm tù trong cái lồng của sự hời hợt.', 'Duy trì cái streak này đi! Nó chính là kiệt tác mà bạn sẽ để lại cho thế hệ mai sau.']
    },
    dailyStatusUpdates: [
      'Đang nghiên cứu xem tại sao con người lại thích trì hoãn hơn là hành động. Có lẽ là do trọng lực não?',
      'Vừa hoàn thành bản phác thảo cho mục tiêu mười năm tới. Mọi thứ đang diễn ra rất hoàn hảo.',
      'Hôm nay tôi dành 3 tiếng để quan sát một giọt nước rơi và nhận ra: Thói quen cũng cần sự đều đặn như vậy.',
      'Thách đấu với Da Vinci? Hãy cho tôi thấy tư duy hệ thống của bạn vượt trội thế nào!'
    ]
  },
  {
    id: 'm24',
    name: 'Doraemon',
    avatar: 'https://images.unsplash.com/photo-1580983135157-268745c92854?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'Mèo Máy Mentor (Mentor Hệ Bảo Bối)',
    quote: 'Không có bảo bối nào mạnh bằng ý chí của chính cháu đâu! Đừng có nhìn vào túi thần kỳ mãi thế!',
    commentStyles: [
      'Giỏi quá cháu ơi! Tặng cháu một cái bánh rán (ảo) vì sự chăm chỉ này nhé!',
      'Uầy, streak này còn xịn hơn cả "Bánh mì ghi nhớ" nữa đó nha! Cố lên!',
      'Cháu mà cứ siêng thế này thì sau này chẳng cần đến bảo bối của bác làm gì nữa đâu.'
    ],
    contextualComments: {
      health: ['Uống nước lọc cho mát bụng, bớt ăn bánh rán lại kẻo béo phì giống bác nha. Hehe.', 'Vận động tí đi cho nó linh hoạt, đừng có nằm ườn ra như Nobita là bác mắng cho đó!'],
      productivity: ['Làm việc nhanh gọn lẹ rồi bác cho mượn "Cánh cửa thần kỳ" đi chơi nè!', 'Năng suất này là "Vip Pro" luôn rồi! Bác rất tin tưởng vào tương lai của cháu.'],
      reading: ['Đọc sách cho nó thông minh ra, bớt ngây ngô để không bị Xeko nó lừa nha.', 'Sách là kho báu, đọc đi bác sẽ cho cháu mượn "Đèn pin thu nhỏ" để khám phá thế giới trong sách!'],
      motivation: ['Đừng có mà bỏ cuộc nhé! Bác luôn ở đây để ủng hộ cháu (nhưng không cho mượn bảo bối làm hộ đâu).', 'Duy trì cái streak này đi! Cháu đang tiến gần đến phiên bản tốt nhất của chính mình rồi đó.']
    },
    dailyStatusUpdates: [
      'Vừa bảo trì cái túi thần kỳ xong, phát hiện ra có quá nhiều bảo bối bị rỉ sét vì Nobita không thèm dùng.',
      'Hôm nay bác thấy hạnh phúc vì có những người bạn chăm chỉ như các cháu bên cạnh.',
      'Mục tiêu hôm nay: Giấu hết bảo bối "Lười biếng" đi để mọi người phải tự lực cánh sinh.',
      'Thách đấu với Doraemon hả? Thua là bác không cho mượn "Máy thời gian" đi chơi đâu nha!'
    ]
  }
];
