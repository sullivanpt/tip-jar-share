import { objectHash } from '~/helpers/nodash'

// const sampleOrganization = {
//   name: 'Club Pluto',
//   id: 'orgId1',
//   // avatar must be buildGravatarUrl(gravatar)
//   // example from https://stackoverflow.com/a/54004588
//   // https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b
//   gravatarMasked: emailMask('jitewaboh@lagify.com'),
//   avatar: buildGravatarUrl('jitewaboh@lagify.com'),
//   timeZone: 'America/Los_Angeles',
//   timeOpen: '11:00',
//   timeClose: '02:00',
//   formulaId: null, // cannot really be null (chicken and egg)
//   stations: [{ id: 1, name: 'bar', position: 'bartender' }],
//   members: [
//     {
//       id: 1, // unique ID of this member within an organization
//       name: 'John Doe', // nickname of this member (ideally unique within organization)
//       code: 'XSEFG-ABCDR',
//       position: 'bar back' // name of formula position to apply to funds from this member
//     }
//   ]
// }

export function organizationFindById(store, organizationId) {
  if (!organizationId) return
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

export function organizationGetVersion(organization) {
  return objectHash(organization)
}

export function organizationReadyToReport(organization) {
  return !!(organization && organization.id && organization.formulaId)
}

export function organizationPositionOptions(store, organization) {
  if (!organization.formulaId) return []
  const formula = store.state.formulas.formulas.find(
    fml => fml.id === organization.formulaId
  )
  if (!formula) return [] // should not happen
  return formula.allocations.map(alc => alc.position)
}

export function hasOrganizationEdit(userId, organization) {
  return organization.members.find(mbr => mbr.edit && mbr.linkedId === userId)
}

export function hasOrganizationClose(userId, organization) {
  return organization.members.find(mbr => mbr.close && mbr.linkedId === userId)
}
