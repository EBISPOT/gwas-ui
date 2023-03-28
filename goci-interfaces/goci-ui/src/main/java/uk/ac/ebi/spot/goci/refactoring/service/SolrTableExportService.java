package uk.ac.ebi.spot.goci.refactoring.service;

import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;

import java.util.List;

public interface SolrTableExportService {

    List<StudyDoc> fetchStudies(String query);

    List<AssociationDoc> fetchAssociations(String query);

    List<EFOTraitDoc> fetchEFOTraits(String query);

}
