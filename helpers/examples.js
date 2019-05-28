import uuidV4 from 'uuid/v4'
import { buildGravatarUrl } from '../helpers/gravatar'
import { emailMask } from '../helpers/masks'
import { defaultStations } from '../helpers/formulas'

export const exampleOrganizationName = 'Club Pluto'

export function cloneExampleOrganization() {
  return {
    name: exampleOrganizationName,
    id: uuidV4(),
    // avatar must be buildGravatarUrl(gravatar)
    // example from https://stackoverflow.com/a/54004588
    // https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b
    gravatarMasked: emailMask('jitewaboh@lagify.com'),
    avatar: buildGravatarUrl('jitewaboh@lagify.com'),
    timeZone: 'America/Los_Angeles',
    timeOpen: '11:00',
    timeClose: '02:00',
    formulaId: null, // cannot really be null (chicken and egg)
    stations: defaultStations(),
    members: [
      {
        id: 'mbr-1', // unique ID of this member within an organization
        name: 'John Doe', // nickname of this member (ideally unique within organization)
        code: 'XSEFG-ABCDR',
        position: 'bar back' // name of formula position to apply to funds from this member
      },
      {
        id: 'mbr-2',
        name: 'Jack Frat',
        code: 'DUK-FOO',
        position: 'bartender',
        edit: true,
        close: true
      },
      {
        id: 'mbr-3',
        name: 'Jennie Brown',
        linkedId: 'usr-3',
        position: 'server',
        edit: true,
        close: true
      },
      // note: away is different than deleted as member still shows in old reports
      // away never have edit
      // away never have an open link code
      { id: 'mbr-4', name: 'Faded Smith', away: true, position: 'bar back' },
      // 3 sample members per position
      { id: 'mbr-5', name: 'Jose Williams', position: 'bar back' },
      { id: 'mbr-6', name: 'Silvia Sanchez', position: 'bar back' },
      { id: 'mbr-7', name: 'Ernest Brady', position: 'bartender' },
      { id: 'mbr-8', name: 'Young Luck', position: 'bartender' },
      { id: 'mbr-9', name: 'Felicity Yeh', position: 'server' },
      { id: 'mbr-10', name: 'Garret Quan', position: 'server' }
    ].map(mbr =>
      Object.assign(
        { code: null, linkedId: null, edit: false, close: false, away: false },
        mbr
      )
    )
  }
}

function genCurrency(v) {
  return (Math.random() * v + v / 2).toFixed(2)
}

export function populateExampleReport(report) {
  report.status = 'closed'
  report.collections.forEach(col => {
    col.done = true
    col.tipsCash = '123.45'
  })
  report.reporters.forEach(rptr => {
    rptr.done = true
    rptr.hours = (Math.random() * 8).toFixed(3)
    if (rptr.salesTotalShow) rptr.salesTotal = genCurrency(500)
    if (rptr.salesExcludedShow) rptr.salesExcluded = genCurrency(40)
    if (rptr.tipsPosShow) rptr.tipsPos = genCurrency(100)
    if (rptr.tipsCashShow) rptr.tipsCash = genCurrency(50)
  })
}
