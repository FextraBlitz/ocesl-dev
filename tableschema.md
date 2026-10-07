## Table `STAFF`

auth can be 'D' for Dean or 'S' for regular staff, position is text

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `email` | `varchar` |  Unique |
| `name` | `varchar` |  |
| `position` | `varchar` |  Nullable |
| `authority` | `varchar` |  Nullable |

## Table `REPORT`

type is CE, CO, SL

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `type` | `varchar` |  Nullable |
| `name` | `text` |  |
| `date` | `timestamptz` |  Nullable |
| `dean_accepted` | `bool` |  |
| `locked` | `bool` |  |
| `members` | `int2` |  Nullable |
| `location` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `objectives` | `text` |  Nullable |
| `outcomes` | `text` |  Nullable |
| `remarks` | `text` |  Nullable |
| `unit_id` | `int8` |  |
| `drive_link` | `text` |  Nullable |
| `comment` | `text` |  Nullable |

## Table `UNIT`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `email` | `text` |  Unique |
| `name` | `text` |  |
| `code` | `varchar` |  Nullable |

## Table `MANAGEMENT`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `staff_id` | `int8` | Primary |
| `unit_id` | `int8` | Primary |
| `position` | `text` |  Nullable |

## Table `EDIT`

collects staff that have contributed to the report AT SOME POINT

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `staff_id` | `int8` | Primary Identity |
| `report_id` | `int8` | Primary |
| `date` | `timestamptz` |  Nullable |

## RLS Policies

### `STAFF`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `STAFF AUTHENTICATED` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `UNIT`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `UNIT AUTHENTICATED` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `MANAGEMENT`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `MANAGEMENT AUTHENTICATED` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `REPORT`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `REPORT AUTHENTICATED` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `EDIT`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `EDIT AUTHENTICATED` | ALL | authenticated | PERMISSIVE | `true` | `true` |

