package uk.ac.ebi.spot.goci.refactoring.util;

import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class SolrEntityTransformerUtility {


    private final static DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ssZ");
    public  List<EFOKeyLabel> getEFOLinks(List<String> efoLink) {

        return efoLink.stream().map(this::splitEFOText)
                .collect(Collectors.toList());
    }

    public  List<EFOKeyLabel> getEFOLinksfromUri(List<String> efoMappedLabel, List<String> efoMappedUri) {
        List<EFOKeyLabel> arr = new ArrayList<>();
        for(int i = 0; i < efoMappedLabel.size(); i++) {
            String efoId = efoMappedUri.get(i).substring(efoMappedUri.get(i).lastIndexOf("/")+1);
            arr.add(new EFOKeyLabel(efoId,efoMappedLabel.get(i)));
        }
        return arr;
    }


    private EFOKeyLabel splitEFOText(String efoText) {
        String[] text = efoText.split("\\|");
        return new EFOKeyLabel(text[1],text[0]);
    }

    public LocalDate formatPubDate(String pubDate) {
        return LocalDate.parse(pubDate, dtf );
    }

    public String retreiveEFOFromUri(String uri) {
        return uri.substring(uri.lastIndexOf("/") + 1);
    }
}
