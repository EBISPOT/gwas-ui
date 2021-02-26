package uk.ac.ebi.spot.goci.model;

public class StudyResult extends SearchResult{

        private String facet = "study";

        private String accessionId;

        public String getAccessionId() {
            return accessionId;
        }

        public void setAccessionId(String accessionId) {
            this.accessionId = accessionId;
        }

}

