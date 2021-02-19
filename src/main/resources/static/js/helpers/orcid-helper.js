/** First refactoring action: common js - DRY. Orcid must be a library.  */

function create_orcid_link(orcid, size)
{
    return '&nbsp;<a href="'+ gwasProperties.ORCID_URL + orcid + '" target="_blank"><img alt="Orcid profile" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" width="'+size+'" height="'+size+'" hspace="4" /></a>';
}
