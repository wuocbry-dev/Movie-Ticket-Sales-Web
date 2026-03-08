import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="privacy-policy-overlay" onClick={onClose}>
      <div className="privacy-policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-policy-header">
          <h2>CHÍNH SÁCH BẢO MẬT</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="privacy-policy-content">
          <section>
            <h3>1. TỔNG QUAN VỀ CHÍNH SÁCH BẢO MẬT</h3>
            <p>
              QV2K hiểu rằng Khách Hàng quan tâm đến việc dữ liệu cá nhân của Khách Hàng sẽ được sử dụng và chia sẻ như thế nào. 
              QV2K rất coi trọng sự tin tưởng của Khách Hàng, vì vậy QV2K sẽ sử dụng những dữ liệu mà Khách Hàng cung cấp một cách 
              cẩn thận và hợp lý, phù hợp với quy định của pháp luật.
            </p>
            <p>
              Website: <strong>www.QV2K.com.vn</strong> thuộc quyền sở hữu của Công ty Cổ phần Giải trí – Phát hành phim – 
              Rạp chiếu phim Đom Đóm (QV2K), địa chỉ: Quận CamPuChia, TP.HCM.
            </p>
            <p>
              QV2K cam kết tôn trọng quyền riêng tư và những vấn đề cá nhân của tất cả Khách Hàng trên website của QV2K. 
              QV2K nhận thức được tầm quan trọng của các dữ liệu cá nhân mà Khách Hàng đã cung cấp cho QV2K và tin rằng 
              trách nhiệm của QV2K là quản lý đúng cách, bảo vệ và xử lý dữ liệu cá nhân của Khách Hàng.
            </p>
            <p>
              <strong>"Dữ liệu cá nhân"</strong> là các thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh 
              hoặc dạng tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể.
            </p>
          </section>

          <section>
            <h3>2. PHẠM VI XỬ LÝ THÔNG TIN</h3>
            <p>Dữ liệu cá nhân được thu thập trong phạm vi thực hiện Chính Sách này là "Dữ liệu cá nhân cơ bản" bao gồm:</p>
            <ol>
              <li>Họ và tên</li>
              <li>Ngày, tháng, năm sinh</li>
              <li>Giới tính</li>
              <li>Địa chỉ cư trú</li>
              <li>Số điện thoại</li>
              <li>Số chứng minh nhân dân, số định danh cá nhân, số hộ chiếu, số giấy phép lái xe</li>
              <li>Thông tin về tài khoản số thanh toán của cá nhân</li>
              <li>Địa chỉ email</li>
            </ol>
            <p className="warning">
              <strong>Lưu ý:</strong> Khách Hàng là người dưới 16 tuổi chỉ được đánh dấu vào ô đồng ý sau khi được sự đồng ý 
              của cha, mẹ hoặc người giám hộ hợp pháp.
            </p>
          </section>

          <section>
            <h3>3. MỤC ĐÍCH XỬ LÝ THÔNG TIN</h3>
            <p>Mục đích thu thập, xử lý Thông Tin Khách Hàng bao gồm:</p>
            <ol>
              <li>Cung cấp các dịch vụ, sản phẩm theo nhu cầu của Khách Hàng</li>
              <li>Liên hệ xác nhận khi Khách Hàng đăng ký sử dụng dịch vụ, xác lập giao dịch trên Website</li>
              <li>Thực hiện việc quản lý Website, gửi thông tin cập nhật về Website, các chương trình khuyến mại, ưu đãi/tri ân tới Khách Hàng</li>
              <li>Bảo đảm quyền lợi của Khách Hàng khi phát hiện các hành động giả mạo, phá hoại tài khoản, lừa đảo Khách Hàng</li>
              <li>Liên lạc, hỗ trợ, giải quyết với Khách Hàng trong các trường hợp đặc biệt</li>
            </ol>
          </section>

          <section>
            <h3>4. LƯU GIỮ VÀ BẢO MẬT THÔNG TIN</h3>
            <p>
              Thông Tin Khách Hàng, cũng như các thông tin trao đổi giữa Khách Hàng và QV2K, đều được lưu giữ và bảo mật 
              bởi hệ thống của QV2K.
            </p>
            <p>
              QV2K sẽ lưu trữ Thông Tin Khách Hàng theo quy định pháp luật hiện hành. Nếu Khách Hàng ngừng sử dụng Website, 
              hoặc việc cho phép Khách Hàng sử dụng Website bị chấm dứt, QV2K có thể tiếp tục lưu trữ, sử dụng và/hoặc 
              tiết lộ Thông Tin Khách Hàng phù hợp với Chính Sách Bảo Mật.
            </p>
          </section>

          <section>
            <h3>5. THỜI GIAN LƯU TRỮ THÔNG TIN</h3>
            <p>
              Thông Tin Khách Hàng sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự thành viên đăng nhập và thực hiện đóng tài khoản. 
              Đối với các tài khoản đã đóng, QV2K vẫn lưu trữ Thông Tin Khách Hàng trong hệ thống máy chủ tối đa 
              <strong> mười hai (12) tháng</strong> kể từ ngày Khách Hàng đóng tài khoản.
            </p>
          </section>

          <section>
            <h3>6. TỔ CHỨC, CÁ NHÂN ĐƯỢC XỬ LÝ THÔNG TIN</h3>
            <p>
              QV2K và các công ty thành viên, các chi nhánh của mình sẽ thực hiện xử lý dữ liệu thông tin cá nhân của Khách Hàng. 
              QV2K không cung cấp Thông Tin Khách Hàng cho bất kỳ bên thứ ba nào khác trừ các trường hợp ngoại lệ không cần 
              sự đồng ý của Khách Hàng theo quy định của pháp luật.
            </p>
          </section>

          <section>
            <h3>7. QUYỀN VÀ NGHĨA VỤ CỦA KHÁCH HÀNG</h3>
            
            <h4>A. Quyền của Khách Hàng</h4>
            <ol>
              <li><strong>Quyền được biết:</strong> Khách Hàng được biết về hoạt động xử lý dữ liệu cá nhân của mình</li>
              <li><strong>Quyền đồng ý:</strong> Khách Hàng được đồng ý hoặc không đồng ý cho phép xử lý dữ liệu cá nhân</li>
              <li><strong>Quyền truy cập:</strong> Khách Hàng được truy cập để xem, chỉnh sửa dữ liệu cá nhân của mình</li>
              <li><strong>Quyền rút lại sự đồng ý:</strong> Khách Hàng được quyền rút lại sự đồng ý của mình</li>
              <li><strong>Quyền xóa dữ liệu:</strong> Khách Hàng được xóa hoặc yêu cầu xóa dữ liệu cá nhân</li>
              <li><strong>Quyền hạn chế xử lý dữ liệu:</strong> Thực hiện trong 72 giờ sau khi có yêu cầu</li>
              <li><strong>Quyền cung cấp dữ liệu:</strong> Yêu cầu QV2K cung cấp lại dữ liệu cá nhân</li>
              <li><strong>Quyền phản đối xử lý dữ liệu:</strong> Ngăn chặn sử dụng cho mục đích quảng cáo, tiếp thị</li>
              <li><strong>Quyền khiếu nại, tố cáo, khởi kiện:</strong> Theo quy định của pháp luật</li>
              <li><strong>Quyền yêu cầu bồi thường thiệt hại:</strong> Khi xảy ra vi phạm quy định</li>
            </ol>

            <h4>B. Nghĩa vụ của Khách Hàng</h4>
            <ol>
              <li>Tự bảo vệ dữ liệu cá nhân của mình</li>
              <li>Tôn trọng, bảo vệ dữ liệu cá nhân của người khác</li>
              <li>Cung cấp đầy đủ, chính xác dữ liệu cá nhân khi đồng ý</li>
              <li>Tham gia tuyên truyền, phổ biến kỹ năng bảo vệ dữ liệu cá nhân</li>
              <li>Thực hiện quy định của pháp luật về bảo vệ dữ liệu cá nhân</li>
            </ol>
          </section>

          <section>
            <h3>8. THÔNG BÁO VÀ SỬA ĐỔI</h3>
            <p>
              Do QV2K liên tục cải thiện dịch vụ và sản phẩm, nên Chính Sách Bảo Mật có thể thường xuyên được thay đổi và cập nhật. 
              QV2K có thể đăng tải trên Website hoặc gửi email thông báo cho Khách Hàng về những thay đổi.
            </p>
          </section>

          <section>
            <h3>9. CAM KẾT CHUNG</h3>
            <p>
              QV2K cam kết bảo mật thông tin, không chia sẻ, tiết lộ, chuyển giao Thông Tin Khách Hàng cho bất kỳ bên thứ ba nào 
              khi chưa được sự đồng ý của Khách Hàng, trừ các trường hợp pháp luật cho phép.
            </p>
            <p>
              QV2K sẽ áp dụng các giải pháp công nghệ để ngăn chặn các hành vi đánh cắp hoặc tiếp cận thông tin trái phép. 
              Khách Hàng có nghĩa vụ bảo mật tên đăng ký, mật khẩu và hộp thư điện tử của mình.
            </p>
          </section>

          <section>
            <h3>10. THÔNG TIN LIÊN HỆ</h3>
            <div className="contact-info">
              <p><strong>CÔNG TY CỔ PHẦN GIẢI TRÍ PHÁT HÀNH PHIM – RẠP CHIẾU PHIM ĐOM ĐÓM</strong></p>
              <p>Mã số thuế: 0123456789</p>
              <p>Địa chỉ: Quận CamPuChia, TP.HCM</p>
              <p>Hotline: +84 123456789</p>
              <p>Email: cskh@QV2K.com.vn</p>
            </div>
          </section>
        </div>

        <div className="privacy-policy-footer">
          <button className="accept-button" onClick={onClose}>Đã hiểu</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
