import os

from uuid import uuid4
from django.core.exceptions import BadRequest
from django.db import models
from django.contrib.auth.models import AbstractUser
from utils.utils import dummy_unique_str
# from staffcalendar.models import ShiftManager


def upload_image(instance,filename ):
    return os.path.join('images', 'avatars', str(instance.pk), filename)

def upload_xlsx(instance, filename):
    base, extension = os.path.splitext(filename)
    if base.lower() != 'employee_batch' and extension.lower() !="xlsx":
        return BadRequest("Invalid File-type uploaded. File name must be 'employee_batch.xlsx'")
    return f"workbooks/{str(filename)}"
    # return os.path.join( 'workbooks', str(filename )



# Create your models here.
class User(AbstractUser):
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    username = models.CharField(max_length=50,unique=True)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username', 'password']


class UserProfile(models.Model):
    pkid = models.BigAutoField(primary_key=True, editable=False)
    id = models.UUIDField(default=uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reader_uid = models.CharField(max_length=128,default=dummy_unique_str, unique=True)
    profile_image = models.ImageField(upload_to=upload_image, blank=True, null=True)
    category = models.ForeignKey("EmployeeCategory", null=True, on_delete=models.SET_NULL)
    department = models.CharField(max_length=225)
    location = models.ForeignKey("Location", null=True, on_delete=models.SET_NULL)
    # shift = models.ForeignKey(ShiftManager, null=True, on_delete=models.SET_NULL)

    def __str__(self) -> str:
        return self.user.username

class Location(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.name}"

class EmployeeCategory(models.Model):
    cat_name = models.CharField(max_length=125)
    allowed_meal_access = models.PositiveSmallIntegerField(default=1)
    description = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.cat_name}"


class EmployeeBatchUpload(models.Model):
    batch_file = models.FileField(upload_to=upload_xlsx, blank=True, null=True)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self)-> str:
        return self.uploaded_by.username
