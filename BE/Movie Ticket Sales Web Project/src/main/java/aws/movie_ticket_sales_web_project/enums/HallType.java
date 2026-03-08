package aws.movie_ticket_sales_web_project.enums;

public enum HallType {
    TWO_D("2D"),
    THREE_D("3D"),
    IMAX("IMAX"),
    FOUR_DX("4DX"),
    SCREEN_X("SCREENX");

    private final String displayName;

    HallType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}