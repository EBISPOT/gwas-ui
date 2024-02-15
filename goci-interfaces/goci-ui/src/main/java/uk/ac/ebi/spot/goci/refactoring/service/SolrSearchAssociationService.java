package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;

public interface SolrSearchAssociationService {

   Page<AssociationDoc> searchAssociations(String query, Pageable pageable, SearchAssociationDTO searchAssociationDTO);

   MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query, SearchAssociationDTO searchAssociationDTO ,
                                                         String sortParam);

   String buildFilterQuery(String filterQuery, SearchAssociationDTO searchAssociationDTO);

   String buildSortParam(Pageable pageable);
}
