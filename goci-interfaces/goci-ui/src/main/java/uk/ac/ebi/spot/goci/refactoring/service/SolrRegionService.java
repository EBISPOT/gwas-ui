package uk.ac.ebi.spot.goci.refactoring.service;

import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;

import java.util.List;

public interface SolrRegionService {

    List<AssociationDoc> searchAssociations(String query);
}
