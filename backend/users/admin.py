from django.contrib import admin
from .models import User, Etudiant, Enseignant
# Register your models here.
admin.site.site_header = 'Evalia'
admin.site.site_title = 'Evalia'
admin.site.index_title = 'Evalia'

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_active')
    list_filter = ('user_type', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)


admin.site.register(Etudiant)
admin.site.register(Enseignant)
