package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different movie format types
 */
public enum FormatType {
    _2D("2D"),      // Phim 2D
    _3D("3D"),      // Phim 3D
    IMAX("IMAX"),   // Định dạng IMAX
    _4DX("4DX"),    // Định dạng 4DX
    SCREENX("SCREENX"); // Định dạng ScreenX

    private final String value;

    FormatType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}