const newPasswordEmail = (fullName, newPassword) => `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mật khẩu mới của bạn</title>
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
        .password {
            background-color: #e74c3c;
            color: white;
            padding: 10px;
            border-radius: 3px;
            font-size: 18px;
            margin: 20px 0;
        }
        .warning {
            color: #e74c3c;
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
        <h1>Mật khẩu mới của bạn</h1>
        <p>Xin chào ${fullName},</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mật khẩu mới của bạn:</p>
        <p class="password">${newPassword}</p>
        <p class="warning">Vui lòng đăng nhập và thay đổi mật khẩu này ngay lập tức!</p>
        <p>Để bảo mật tài khoản của bạn, vui lòng thực hiện các bước sau:</p>
        <ol>
            <li>Đăng nhập vào tài khoản của bạn bằng mật khẩu mới này.</li>
            <li>Truy cập vào phần cài đặt tài khoản.</li>
            <li>Chọn tùy chọn "Đổi mật khẩu".</li>
            <li>Tạo một mật khẩu mới, mạnh và duy nhất.</li>
        </ol>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi ngay lập tức.</p>
        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            <p>&copy; 2024 Lộc Hiếu Health Clinic. Bảo lưu mọi quyền.</p>
        </div>
    </div>
</body>
</html>`

export default newPasswordEmail;
