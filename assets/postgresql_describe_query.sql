select 
    f.attnum as number,
    f.attname as field,
    f.attnotnull as notnull,
    pg_catalog.format_type(f.atttypid,f.atttypmod) as data_type,
    case when p.contype   = 'p' then true else false end as primarykey,
    case when p.contype   = 'u' then true else false end as uniquekey,
    case when p.contype   = 'f' then g.relname       end as foreignkey,
    case when p.contype   = 'f' then p.confkey       end as foreignkey_fieldnum,
    case when p.contype   = 'f' then p.conkey        end as foreignkey_column,
    case when f.atthasdef = 't' then d.adsrc         end as default_value
from pg_attribute f
    join pg_class c on c.oid = f.attrelid
    join pg_type t on t.oid = f.atttypid
    left join pg_attrdef d on d.adrelid = c.oid and d.adnum = f.attnum
    left join pg_constraint p on p.conrelid = c.oid and f.attnum = any (p.conkey)
    left join pg_class as g on p.confrelid = g.oid
where c.relkind = 'r'
    and c.relname = '?'
    and f.attnum > 0 order by number