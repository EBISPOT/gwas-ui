package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;

import java.io.IOException;

public interface SolrSearchStudyService {

    Page<StudyDoc> searchStudies(String query, Pageable pageable, SearchStudyDTO searchStudyDTO) throws IOException;

    MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query, SearchStudyDTO searchStudyDTO ,
                                                   String sortParam);


    String buildFilterQuery(String filterQuery, SearchStudyDTO searchStudyDTO);

    String buildSortParam(Pageable pageable);
}
