import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContactFormDto } from './dto/update-contact-form.dto';

const CONTACT_SECTION_KEY = 'contact';

const CONTACT_FIELD_KEYS = {
  name: 'name',
  phone: 'phone',
  question: 'question',
} as const;

@Injectable()
export class ContactFormService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: CONTACT_SECTION_KEY,
      },
      include: {
        items: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('The Contact Form section was not found');
    }

    const nameItem =
      section.items.find((item) => item.iconName === CONTACT_FIELD_KEYS.name) ??
      section.items[0];

    const phoneItem =
      section.items.find(
        (item) => item.iconName === CONTACT_FIELD_KEYS.phone,
      ) ?? section.items[1];

    const questionItem =
      section.items.find(
        (item) => item.iconName === CONTACT_FIELD_KEYS.question,
      ) ?? section.items[2];

    return {
      id: section.id,
      sectionKey: section.sectionKey,
      sectionType: section.sectionType,
      title: section.title,
      description: section.body,
      submitButtonText: section.buttonText,
      displayOrder: section.displayOrder,
      isActive: section.isActive,
      updatedAt: section.updatedAt,

      fields: {
        name: {
          label: nameItem?.title ?? '',
          placeholder: nameItem?.description ?? '',
        },

        phone: {
          label: phoneItem?.title ?? '',
          placeholder: phoneItem?.description ?? '',
        },

        question: {
          label: questionItem?.title ?? '',
          placeholder: questionItem?.description ?? '',
        },
      },
    };
  }

  async updateSection(updateDto: UpdateContactFormDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: CONTACT_SECTION_KEY,
      },
      select: {
        id: true,
      },
    });

    if (!existingSection) {
      throw new NotFoundException('The Contact Form section was not found');
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),
          body: updateDto.description.trim(),
          buttonText: updateDto.submitButtonText.trim(),
          isActive: true,
        },
      });

      /*
       * The form always has exactly three fixed
       * field configurations:
       * name, phone, and question.
       */
      await transaction.homepageSectionItem.deleteMany({
        where: {
          sectionId: existingSection.id,
        },
      });

      await transaction.homepageSectionItem.createMany({
        data: [
          {
            sectionId: existingSection.id,
            title: updateDto.nameField.label.trim(),
            description: updateDto.nameField.placeholder.trim(),
            iconName: CONTACT_FIELD_KEYS.name,
            displayOrder: 0,
            isActive: true,
          },
          {
            sectionId: existingSection.id,
            title: updateDto.phoneField.label.trim(),
            description: updateDto.phoneField.placeholder.trim(),
            iconName: CONTACT_FIELD_KEYS.phone,
            displayOrder: 1,
            isActive: true,
          },
          {
            sectionId: existingSection.id,
            title: updateDto.questionField.label.trim(),
            description: updateDto.questionField.placeholder.trim(),
            iconName: CONTACT_FIELD_KEYS.question,
            displayOrder: 2,
            isActive: true,
          },
        ],
      });
    });

    return this.getSection();
  }
}
