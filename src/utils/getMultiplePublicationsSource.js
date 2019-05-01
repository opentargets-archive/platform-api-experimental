const getMultiplePublicationsSource = pmIds => {
  if (pmIds.length === 0) {
    return null;
  }
  const name = `${pmIds.length} publication${pmIds.length > 1 ? 's' : ''}`;
  const url = `https://europepmc.org/search?query=${pmIds
    .map(pmId => (pmId.substring(0, 3) === 'PMC' ? pmId : `EXT_ID:${pmId}`))
    .join(' OR ')}`;
  return { name, url };
};

export default getMultiplePublicationsSource;
