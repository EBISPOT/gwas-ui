package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uk.ac.ebi.spot.goci.model.solr.Doc;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;

import java.io.IOException;

public interface SolrSearchService {

    public Page<StudyDoc> searchStudies(String rsId, Pageable pageable, SearchStudyDTO searchStudyDTO) throws IOException;
}
