package uk.ac.ebi.spot.goci.refactoring.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchAssociationService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrTableExportService;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.STUDIES)
public class SolrSearchStudiesController {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchStudiesController.class);
    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;
    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;
    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;

    @Autowired
    SolrTableExportService solrTableExportService;
    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/{accessionId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<AssociationSolrDTO>> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                                  @PathVariable String accessionId,
                                                                                  @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                                  PagedResourcesAssembler<AssociationDoc> assembler) throws IOException {
        log.info(" Inside  searchAssociations ");
        String query = solrQueryParamBuilder.buildQueryParam("GCST", accessionId);
        Page<AssociationDoc> pageStudyAsscns = solrSearchAssociationService.searchAssociations(query,pageable,searchAssociationDTO);
        PagedModel<AssociationSolrDTO> pagedModel = assembler.toModel(pageStudyAsscns, associationSolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }

    @GetMapping(value = "/{accessionId}/associations/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadAssociations(SearchAssociationDTO searchAssociationDTO,
                                                   @PathVariable String accessionId,
                                                   @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GCST", accessionId);
        List<AssociationDoc> asscnDocList = solrTableExportService.fetchAssociations(query, searchAssociationDTO,  pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readAssociationHeaderContent(asscnDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + accessionId + "_associations_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }
}
