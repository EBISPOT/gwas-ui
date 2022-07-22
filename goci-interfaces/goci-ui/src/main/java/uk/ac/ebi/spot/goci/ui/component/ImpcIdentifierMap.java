package uk.ac.ebi.spot.goci.ui.component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class ImpcIdentifierMap {

    private static final Logger log = LoggerFactory.getLogger(ImpcIdentifierMap.class);
    private Map<String, String> impcGeneMap;

    /** Populate a Singleton Hash Map with  gene as key &
     * MGIdentifier as Value
     *
     * */
    public Map<String, String> createImpcGeneMap(File file) {
        Map<String, String> geneMap = null;
        try {
            geneMap = new HashMap<>();
            BufferedReader reader = new BufferedReader(new FileReader(file));
            String str;
            while((str = reader.readLine()) != null){
                String[] impcArr = str.split("\t");
                geneMap.put(impcArr[0], impcArr[12]);
            }
        } catch(IOException ex){
            log.error("Exception :"+ex.getMessage(),ex);
        }
        return geneMap;
    }

    public Map<String, String> getImpcGeneMap() {
        return impcGeneMap;
    }

    public void setImpcGeneMap(Map<String, String> impcGeneMap) {
        this.impcGeneMap = impcGeneMap;
    }
}
