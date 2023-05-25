package uk.ac.ebi.spot.goci.refactoring.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.dto.*;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.*;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.io.IOException;
import java.io.InputStream;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolrTableExportServiceImpl implements SolrTableExportService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchStudyServiceImpl.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    RestInteractionService restInteractionService;

    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;

    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;

    @Autowired
    SolrSearchStudyService solrSearchStudyService;

    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;

    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;

    @Autowired
    EFOTraitSolrDTOAssembler efoTraitSolrDTOAssembler;

    ObjectMapper objectMapper = new ObjectMapper();

    public List<StudyDoc> fetchStudies(String query, SearchStudyDTO searchStudyDTO, Pageable pageable) {
        String uri = buildURIComponent();
        log.info("The Query is ->"+query);

        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, solrSearchStudyService.buildQueryParams(Integer.MAX_VALUE,
                1, query, searchStudyDTO,
                        solrSearchStudyService.buildSortParam(pageable)));
        if (data != null && data.getResponse() != null) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<StudyDoc> studyDocs = objectMapper.convertValue(docs, new TypeReference<List<StudyDoc>>() {{
            }});
            return studyDocs;
        }
        else{
            return null;
        }
    }

    public List<AssociationDoc> fetchAssociations(String query, SearchAssociationDTO searchAssociationDTO, Pageable pageable) {
        String uri = buildURIComponent();

        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, solrSearchAssociationService.buildQueryParams(Integer.MAX_VALUE, 1, query, searchAssociationDTO, solrSearchAssociationService.buildSortParam(pageable)));
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>() {{
            }});
            return associationDocs;
        } else {
            return null;
        }
    }

    public List<EFOTraitDoc> fetchEFOTraits(String query, SearchEFOTraitDTO searchEFOTraitDTO, Pageable pageable) {
        String uri = buildURIComponent(query);
        SolrData data = restInteractionService.callSolrAPI(uri);
        Sort sort = pageable.getSort();
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>() {{
            }});
            List<EFOTraitDoc> efoTraitsDocs = solrSearchEFOTraitsService.createEFOTraitData(associationDocs, null, searchEFOTraitDTO);
            Sort.Order orderAsscn  = null;
            if(sort != null) {
                orderAsscn = sort.getOrderFor("associationCount");
                if(orderAsscn.isAscending()) {
                    efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount));
                } else {
                    efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
                }
            }else {
                efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
            }
            return efoTraitsDocs;
        } else {
            return null;
        }
    }


    private String buildURIComponent() {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                //.queryParams(buildQueryParams( maxResults, page, query, searchAssociationDTO, sortParam))
                .build();
        return uriComponents.toUriString();
    }


    private String buildURIComponent(String query) {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                .queryParams(buildQueryParams( query,"efo"))
                .build();
        return uriComponents.toUriString();
    }


    private MultiValueMap<String, String> buildQueryParams( String query, String dataType) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(Integer.MAX_VALUE));
        String fq = "";
        String fl = "";
        if(dataType.equals("study")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_STUDY;
            fl = "*";
        }
        if(dataType.equals("association")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
            fl = SearchUIConstants.ASSOCIATION_SOLR_FIELDS;
        }
        if(dataType.equals("efo")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
            fl = SearchUIConstants.EFO_FIELDS;
        }

        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );

        return paramsMap;
    }

    public List<StudyTableExportDTO> readStudyHeaderContent(List<StudyDoc> studyDocs) throws IOException {
        InputStream contents = FileHandler.class.getResourceAsStream(SearchUIConstants.STUDY_HEADER_CONTENT_FILE);
        CsvSchema.Builder builder = CsvSchema.builder();
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = builder.build().withHeader().withColumnSeparator('\t');

        MappingIterator<StudyTableExportDTO> iterator =
                mapper.readerFor(StudyTableExportDTO.class).with(schema).readValues(contents);
        List<StudyTableExportDTO> dtos = iterator.readAll();
        dtos.addAll(studyDocs.stream().map(studySolrDTOAssembler::assembleStudyExport).collect(Collectors.toList()));
        return dtos;
    }

    public List<AssociationTableExportDTO> readAssociationHeaderContent(List<AssociationDoc> associationDocs) throws IOException {
        InputStream contents = FileHandler.class.getResourceAsStream(SearchUIConstants.ASSOCIATION_HEADER_CONTENT_FILE);
        CsvSchema.Builder builder = CsvSchema.builder();
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = builder.build().withHeader().withColumnSeparator('\t');

        MappingIterator<AssociationTableExportDTO> iterator =
                mapper.readerFor(AssociationTableExportDTO.class).with(schema).readValues(contents);
        List<AssociationTableExportDTO> dtos = iterator.readAll();
        dtos.addAll(associationDocs.stream().map(associationSolrDTOAssembler::assembleAssociationExport).collect(Collectors.toList()));
        return dtos;
    }

   public  List<EFOTableExportDTO> readEFOHeaderContent(List<EFOTraitDoc> efoTraitDocs) throws IOException {
       InputStream contents = FileHandler.class.getResourceAsStream(SearchUIConstants.EFO_HEADER_CONTENT_FILE);
       CsvSchema.Builder builder = CsvSchema.builder();
       CsvMapper mapper = new CsvMapper();
       CsvSchema schema = builder.build().withHeader().withColumnSeparator('\t');
       MappingIterator<EFOTableExportDTO> iterator =
               mapper.readerFor(EFOTableExportDTO.class).with(schema).readValues(contents);
       List<EFOTableExportDTO> dtos = iterator.readAll();
       dtos.addAll(efoTraitDocs.stream().map(efoTraitSolrDTOAssembler::assembleEFOExport).collect(Collectors.toList()));
       return dtos;
   }
}
