from . import db
from .models import Tenant, User, Question
import datetime

def create_test_data_if_empty():
    s = db.session()
    if len(s.query(Tenant).all()) == 0:
        print("No data detected.  Creating testing tenant.")

        t = Tenant()
        t.name = "Testing Tenant"
        t.id = "test"
        t.active = True
        s.add(t)

        u = User()
        u.username = "admin"
        u.email = "admin@admin.com"
        u.is_admin = True
        u.tenant_id = t.id
        s.add(u)

        q1 = Question()
        q1.title = "Hello, World"
        q1.body = """
What command prints something to the `console` in Python?
        """
        q1.answer = "print"
        q1.activate_date = datetime.datetime.utcnow()
        q1.deactivate_date = datetime.datetime.utcnow() + datetime.timedelta(days=10)
        q1.tenant_id = t.id
        s.add(q1)

        q2 = Question()
        q2.title = "Author"
        q2.body = """
Who created Python? (first name.  lower case)

```python
import os
print("hello world")
```
        """
        q2.answer = "guido"
        q2.activate_date = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        q2.deactivate_date = datetime.datetime.utcnow() + datetime.timedelta(days=10)
        q2.tenant_id = t.id
        s.add(q2)

        s.commit()
