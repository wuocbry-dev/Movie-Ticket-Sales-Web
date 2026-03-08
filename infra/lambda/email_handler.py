import json
import boto3
import logging
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize SES client
ses_client = boto3.client('ses')

# Configuration - these should be set via environment variables
import os
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@movieticket.com')
CHARSET = 'UTF-8'


def lambda_handler(event, context):
    """
    Lambda handler to process SNS messages and send emails via SES
    
    Flow: SNS Topic -> This Lambda -> SES
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    results = []
    
    for record in event.get('Records', []):
        try:
            # Parse SNS message
            sns_message = record.get('Sns', {}).get('Message', '{}')
            email_request = json.loads(sns_message)
            
            logger.info(f"Processing email request: {email_request.get('emailType')}")
            
            # Determine email type and build content
            email_type = email_request.get('emailType')
            to_email = email_request.get('toEmail')
            subject = email_request.get('subject')
            template_data = email_request.get('templateData', {})
            
            # Generate HTML content based on email type
            if email_request.get('htmlContent'):
                html_content = email_request['htmlContent']
            else:
                html_content = build_email_content(email_type, template_data)
            
            # Send email via SES
            result = send_email_via_ses(to_email, subject, html_content)
            results.append({
                'to': to_email,
                'status': 'success',
                'messageId': result.get('MessageId')
            })
            
        except Exception as e:
            logger.error(f"Error processing record: {str(e)}")
            results.append({
                'status': 'error',
                'error': str(e)
            })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Email processing completed',
            'results': results
        })
    }


def send_email_via_ses(to_email, subject, html_content):
    """
    Send email using AWS SES
    """
    try:
        response = ses_client.send_email(
            Source=FROM_EMAIL,
            Destination={
                'ToAddresses': [to_email]
            },
            Message={
                'Subject': {
                    'Charset': CHARSET,
                    'Data': subject
                },
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': html_content
                    }
                }
            }
        )
        logger.info(f"Email sent successfully to {to_email}. MessageId: {response['MessageId']}")
        return response
        
    except ClientError as e:
        logger.error(f"Failed to send email to {to_email}: {e.response['Error']['Message']}")
        raise


def build_email_content(email_type, template_data):
    """
    Build HTML email content based on email type
    """
    if email_type == 'BOOKING_CONFIRMATION':
        return build_booking_confirmation_email(template_data)
    elif email_type == 'REFUND_CONFIRMATION':
        return build_refund_confirmation_email(template_data)
    elif email_type == 'PASSWORD_RESET':
        return build_password_reset_email(template_data)
    else:
        logger.warning(f"Unknown email type: {email_type}")
        return f"<html><body><p>Email content for: {email_type}</p></body></html>"


def build_booking_confirmation_email(data):
    """
    Build booking confirmation email HTML
    """
    qr_code_section = ""
    if data.get('qrCodeUrl'):
        qr_code_section = f"<img src='{data['qrCodeUrl']}' alt='QR Code' style='max-width: 250px; height: auto; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 8px;' />"
    else:
        qr_code_section = "<p>QR Code sẽ được tạo sau</p>"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
                <h1 style="font-size: 28px; margin-bottom: 10px; font-weight: 600;">🎬 VÉ ĐIỆN TỬ</h1>
                <p style="font-size: 14px; opacity: 0.9;">Đặt vé thành công - Chúc bạn có trải nghiệm tuyệt vời!</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <p style="font-size: 18px; margin-bottom: 20px; color: #2c3e50;">Xin chào <strong>{data.get('customerName', 'Quý khách')}</strong>,</p>
                <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Vé xem phim của bạn đã được xác nhận thành công!</p>
                
                <div style="background: linear-gradient(to right, #f8f9fa, #ffffff); border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h2 style="color: #667eea; font-size: 24px; margin-bottom: 15px;">🎥 {data.get('movieTitle', '')}</h2>
                    <table style="width: 100%;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="font-weight: 600; color: #555; padding: 8px 0;">📍 Rạp chiếu:</td>
                            <td style="color: #2c3e50; padding: 8px 0;">{data.get('cinemaName', '')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="font-weight: 600; color: #555; padding: 8px 0;">🏛️ Phòng:</td>
                            <td style="color: #2c3e50; padding: 8px 0;">{data.get('hallName', '')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="font-weight: 600; color: #555; padding: 8px 0;">📅 Ngày chiếu:</td>
                            <td style="color: #2c3e50; padding: 8px 0;">{data.get('showDate', '')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="font-weight: 600; color: #555; padding: 8px 0;">🕐 Giờ chiếu:</td>
                            <td style="color: #2c3e50; padding: 8px 0;">{data.get('startTime', '')}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600; color: #555; padding: 8px 0;">🎫 Số vé:</td>
                            <td style="color: #2c3e50; padding: 8px 0;">{data.get('totalSeats', 0)} vé</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0;">Tổng thanh toán</p>
                    <div style="font-size: 36px; font-weight: bold; margin: 10px 0;">{data.get('totalAmount', 0):,} ₫</div>
                    <p style="margin: 0;">Đã thanh toán thành công</p>
                </div>
                
                <div style="text-align: center; padding: 30px 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-bottom: 15px; font-size: 20px;">📱 MÃ QR CHECK-IN</h3>
                    <p>Xuất trình mã QR này tại quầy để nhận vé</p>
                    {qr_code_section}
                    <div style="font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0; letter-spacing: 2px;">{data.get('bookingCode', '')}</div>
                    <p style="color: #666; font-size: 14px;">Mã đặt vé của bạn</p>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-bottom: 15px;">⚠️ LƯU Ý QUAN TRỌNG</h3>
                    <ul style="list-style-position: inside; color: #856404; padding-left: 0;">
                        <li style="padding: 5px 0;">Vui lòng có mặt tại rạp <strong>trước 15 phút</strong> so với giờ chiếu</li>
                        <li style="padding: 5px 0;">Mang theo <strong>mã QR</strong> hoặc <strong>mã đặt vé</strong> để check-in</li>
                        <li style="padding: 5px 0;">Vé không được hoàn tiền sau khi đã check-in</li>
                        <li style="padding: 5px 0;">Vui lòng giữ gìn vé và không chia sẻ mã QR với người khác</li>
                    </ul>
                </div>
            </div>
            
            <div style="background: #2c3e50; color: white; text-align: center; padding: 30px 20px;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>MOVIE TICKET SYSTEM</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">Hotline: 1900-xxxx</p>
                <p style="margin: 5px 0; font-size: 14px;">Email: support@movieticket.com</p>
                <p style="margin-top: 15px; opacity: 0.7; font-size: 12px;">© 2025 Movie Ticket System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


def build_refund_confirmation_email(data):
    """
    Build refund confirmation email HTML
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
                <h1 style="font-size: 28px; margin-bottom: 10px;">💰 XÁC NHẬN HOÀN TIỀN</h1>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Xin chào {data.get('customerName', 'Quý khách')},</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Đặt vé <strong>{data.get('bookingCode', '')}</strong> của bạn đã được hoàn tiền.
                </p>
                
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0;">Số tiền hoàn</p>
                    <div style="font-size: 36px; font-weight: bold; margin: 10px 0;">{data.get('refundAmount', 0):,} VNĐ</div>
                </div>
                
                <p style="color: #666; line-height: 1.6;">
                    Số tiền sẽ được chuyển về tài khoản của bạn trong vòng <strong>5-7 ngày làm việc</strong>.
                </p>
                
                <p style="color: #666; line-height: 1.6;">
                    Cảm ơn bạn đã sử dụng dịch vụ!
                </p>
            </div>
            
            <div style="background: #2c3e50; color: white; text-align: center; padding: 20px;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>MOVIE TICKET SYSTEM</strong></p>
                <p style="margin-top: 10px; opacity: 0.7; font-size: 12px;">© 2025 Movie Ticket System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


def build_password_reset_email(data):
    """
    Build password reset email HTML
    """
    return f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Lại Mật Khẩu</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎬 CineTicket</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Hệ Thống Đặt Vé Xem Phim Trực Tuyến</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Xin chào {data.get('fullName', 'Quý khách')},</h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                    Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình:
                </p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Mã Xác Nhận</p>
                    <p style="color: white; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">{data.get('resetCode', '')}</p>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        ⏰ <strong>Lưu ý:</strong> Mã xác nhận này có hiệu lực trong <strong>15 phút</strong>.
                    </p>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                    Tài khoản của bạn vẫn an toàn.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                    Email này được gửi tự động từ hệ thống CineTicket.<br>
                    Vui lòng không trả lời email này.
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2024 CineTicket. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
