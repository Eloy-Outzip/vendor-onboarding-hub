

## Plan: Clean Up Old Category Entries in Vendor Data

### Problem

Several vendors have legacy free-text category values (e.g. `"Miete Zelte"`, `"Ski"`, `"Dachzelte"`, `"Markisen"`) mixed in with or instead of the standardized `cat*` keys. These don't map to any translation and display incorrectly.

### Data Updates

Run three UPDATE statements to clean vendor categories:

| Vendor | Current categories | After cleanup |
|--------|--------------------|---------------|
| **Outzip** | `Miete Zelte, Ski, catClimbing, catBikeBags, catSleepingBags, catBackpacks, catRoofTents, catSnowTouring` | `catClimbing, catBikeBags, catSleepingBags, catBackpacks, catRoofTents, catSnowTouring` |
| **Freiheit auf Rädern** | `Dachzelte, Markisen, Kochboxen, catRoofTents, catOther` | `catRoofTents, catOther` |
| **Dachzelt Hubi** | `Camping Ausrüstung, Zelte, Dachzelte, Dachgepäckträger, Vermietung, Verkauf` | `catRoofTents, catOther` (best-fit mapping) |

### Implementation

Use the database insert/update tool to run three `UPDATE vendors SET categories = ...` statements targeting each vendor by ID. No schema or code changes needed.

