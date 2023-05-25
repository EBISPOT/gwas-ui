package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Pageable;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationTableExportDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.EFOTableExportDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.StudyTableExportDTO;
import uk.ac.ebi.spot.goci.refactoring.model.*;

import java.io.IOException;
import java.util.List;

public interface SolrTableExportService {

    List<StudyDoc> fetchStudies(String query, SearchStudyDTO searchStudyDTO, Pageable pageable);

    List<AssociationDoc> fetchAssociations(String query, SearchAssociationDTO searchAssociationDTO, Pageable pageable);

    List<EFOTraitDoc> fetchEFOTraits(String query, SearchEFOTraitDTO searchEFOTraitDTO, Pageable pageable);

    List<StudyTableExportDTO> readStudyHeaderContent(List<StudyDoc> studyDocs) throws IOException;

    List<AssociationTableExportDTO> readAssociationHeaderContent(List<AssociationDoc> associationDocs) throws IOException;

    List<EFOTableExportDTO> readEFOHeaderContent(List<EFOTraitDoc> efoTraitDocs) throws IOException;

}
