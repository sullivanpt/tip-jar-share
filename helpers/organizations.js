export function organizationFindById(store, organizationId) {
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

export function hasOrganizationEdit(userId, organization) {
  return organization.members.find(mbr => mbr.edit && mbr.linkedId === userId)
}
