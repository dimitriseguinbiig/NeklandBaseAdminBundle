<?php

/*
 * This file is part of the NekLandBaseAdminBundle package.
 *
 * (c) Nekland <http://nekland.fr/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Nekland\Bundle\BaseAdminBundle\Event;

class Events
{
    const
        afterCreate = 'nekland_admin.create',
        afterUpdate = 'nekland_admin.update',
        onConfigureMenu = 'nekland_admin.configure.menu',
        onCrudHydratation = 'nekland_admin.config_hydrate';
}
