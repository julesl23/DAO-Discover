An example implementation of a DAO discovery service.

This app listens to the DAO Caster events and builds up a current state of the DAOs that it is filtered for.

The event parameters returned that are uri links to JSON-LD files on off-chain storage, are then retrieved and displayed on web pages. JSON-LD schemas can help with standardisation and interopability across the eco system.

DAO searches; must be able to type in DAO address and receive event updates for the dao, member, proposal and activity events.
Must show that the JSON-LD files are readable.
Be able to show the proposal updates in chronological order.

Show that proposal updates that are submitted from non-members as a warning.

Also can show a list of members compiled from the member event updates.