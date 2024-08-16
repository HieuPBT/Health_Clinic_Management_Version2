const appointmentConfirmationEmail = (fullName, isConfirmed, department, bookingDate, bookingTime, rejectionReason) => {

    console.log('bookingDate', bookingDate);
    console.log('bookingTime', bookingTime);
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo về cuộc hẹn của bạn</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
        }
        .appointment-details {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .status-confirmed {
            color: #27ae60;
            font-weight: bold;
        }
        .status-rejected {
            color: #c0392b;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Thông báo về cuộc hẹn của bạn</h1>
        <p>Kính gửi ${fullName},</p>

        ${isConfirmed ? `<p>Chúng tôi xin thông báo rằng cuộc hẹn của bạn đã được <span class="status-confirmed">XÁC NHẬN</span>. Chi tiết cuộc hẹn như sau:</p>` : `<p>Chúng tôi rất tiếc phải thông báo rằng cuộc hẹn của bạn đã bị <span class="status-rejected">TỪ CHỐI</span>. Chi tiết cuộc hẹn như sau:</p>`}

        <div class="appointment-details">
            <p><strong>Khoa/Phòng:</strong> ${department}</p>
            <p><strong>Ngày:</strong> ${bookingTime}</p>
            <p><strong>Giờ:</strong> ${bookingDate}</p>
            <p><strong>Trạng thái:</strong> ${isConfirmed ? "Đã được xác nhận" : "Đã bị từ chối"}</p>
        </div>

        ${isConfirmed ? "<p>Vui lòng đến đúng giờ để đảm bảo quá trình khám và điều trị được suôn sẻ. Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi càng sớm càng tốt.</p>" : `<p>Lý do từ chối: ${rejectionReason}</p>
        <p>Nếu bạn muốn đặt lại cuộc hẹn hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua số điện thoại hoặc email dưới đây.</p>`}


        <p>Trân trọng,<br>Lộc Hiếu Health Clinic</p>

        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            <p>&copy; 2024 Lộc Hiếu Health Clinic. Bảo lưu mọi quyền.</p>
        </div>
    </div>
</body>
</html>`
};


export default appointmentConfirmationEmail;
