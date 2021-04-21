import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'applications',
        title: '',
        type: 'group',
        icon: 'apps',
        children: [
            {
                id: 'announcement',
                title: 'Announcement',
                type: 'item',
                icon:'volume_up',
                url: '/apps/TestApp/announcement'
            },
        ]
    }
];
