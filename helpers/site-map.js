/**
 * the application name
 */
export const applicationTitle = 'tip-jar-share (beta)'

/**
 * the application version
 */
export const gitRepoVersion = __GIT_REPO_VERSION__ // eslint-disable-line no-undef

/**
 * primary navigation menu items
 * notice: these pages are purposely not listed here
 *  - '/me/login' and '/me/enroll' as login can be started from other pages
 *  - '/docs/policies' is linked from about and login pages
 */
export function primaryMenuItems({ meAvatar, meName, organizationId }) {
  return [
    {
      icon: 'publish',
      title: 'Dashboard',
      to: '/'
    },
    {
      icon: 'cloud_download',
      title: 'Reports',
      to: `/organizations/${organizationId}/actions/daily`,
      hide: !organizationId
    },
    {
      icon: 'group_work',
      title: 'Teams',
      to: '/organizations'
    },
    {
      icon: 'refresh',
      title: 'Refresh',
      action: 'refresh',
      hide: !organizationId
    },
    {
      icon: 'account_circle',
      avatar: meAvatar,
      title: 'Me',
      subtitle: meName,
      to: '/me'
    },
    {
      icon: 'contact_support',
      avatar: '/icon.png',
      title: 'About',
      subtitle: applicationTitle,
      to: '/about'
    }
  ].filter(itm => !itm.hide)
}
