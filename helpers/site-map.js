/**
 * the application name
 */
export const applicationTitle = 'tip-jar-share (beta)'

/**
 * primary navigation menu items
 * notice: '/login' is purposely not listed here as login can be started from other pages
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
      to: `/organizations/${organizationId}/reports`
    },
    {
      icon: 'group_work',
      title: 'Teams',
      to: '/organizations'
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
      avatar: '/ptksll-duck.png',
      title: 'About',
      subtitle: applicationTitle,
      to: '/about'
    }
  ].filter(itm => !itm.to.includes('/null/')) // elide any missing dynamic IDs
}
