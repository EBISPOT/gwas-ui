package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

public interface SolrSearchAssociationService {

   Page<AssociationDoc> searchAssociations(String query, Pageable pageable, SearchAssociationDTO searchAssociationDTO);
}