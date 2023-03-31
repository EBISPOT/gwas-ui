package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;

import java.util.List;
import java.util.Map;

public interface SolrSearchEFOTraitService {

    Map<String, String> getOLSTerms(String efoId);

    List<String> getChildTraits(Map<String, String> olsTerms);

    List<String> getChildTraitLabels(List<String> childTraits);

    Page<AssociationDoc> searchAssociations(String query, Pageable pageable);
}
