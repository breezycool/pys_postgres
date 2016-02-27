### NB: No longer maintained.

# Polled You So

The code for [https://www.polledyouso.com](https://www.polledyouso.com), a Django web app that intends to allow users to ask localized polls, and see the data associated with each poll.

### develop
Make sure you have [Django](https://docs.djangoproject.com/en/1.9/topics/install/) and [Postgresql](http://www.postgresql.org/download/) installed on your local machine.

```bash
git clone https://github.com/breezykermo/polledyouso && cd polledyouso
```

Edit the DATABASES object in ```pys/settings.py```, and run your Postgresql server.

```bash
python manage.py syncdb
python manage.py runserver
```

### credits
Developed by Lachlan Kermode, Jesse Goodman, Casey Kolb and Terrence Kuo for COS 333 at Princeton University, in 2015.
