package aws.movie_ticket_sales_web_project.converter;

import aws.movie_ticket_sales_web_project.enums.FormatType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter to map FormatType enum to database ENUM values
 * Converts _2D -> "2D", _3D -> "3D", etc.
 */
@Converter(autoApply = true)
public class FormatTypeConverter implements AttributeConverter<FormatType, String> {

    @Override
    public String convertToDatabaseColumn(FormatType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public FormatType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        for (FormatType formatType : FormatType.values()) {
            if (formatType.getValue().equals(dbData)) {
                return formatType;
            }
        }

        throw new IllegalArgumentException("Unknown database value: " + dbData);
    }
}
