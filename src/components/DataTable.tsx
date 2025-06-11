import { FunctionComponent, ReactNode } from "react";
import { cap } from "../lib/cap";
import { useTranslation } from "react-i18next";
import DataTable from 'datatables.net-react';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-searchpanes-dt';
import 'datatables.net-select-dt';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// CSS
import "../components/DataTable.css";

pdfMake.vfs = (pdfFonts as any).vfs;
DataTablesCore.Buttons.pdfMake(pdfMake);
DataTable.use(DataTablesCore);

// Eventually, DataTable should provide advanced features,
// such as sorting per different columns, or even filtering
// TODO: investigate existing components that do it already
export const DataTableComponent: FunctionComponent<{
  children: ReactNode,
  columns: number,
}> = ({
  children, columns
}) => {
    const { t, i18n } = useTranslation('translation');

    function getDataTableOptions() {
      const targets = Array.from({ length: columns }, (v, i) => i);

      return {
        responsive: true,
        select: true,
        destroy: true,
        buttons: [
          {
            extend: 'searchPanes',
            text: cap(t('searchPanes')),
            config: {
              layout: `columns-${columns}`
            }
          },
          {
            extend: 'collection',
            text: cap(t('export')),
            buttons: [
              {
                extend: 'copy',
                text: t('copy'),
              },
              {
                extend: 'csv',
                text: t('csv'),
              },
              {
                extend: 'pdfHtml5',
                text: t('pdf'),
              }
            ]
          }
        ],
        language: {
          info: cap(t('showing page _PAGE_ of _PAGES_')),
          infoFiltered: cap(t('(filtered from _MAX_ total entries)')),
          lengthMenu: cap(t('_MENU_ entries per page')),
          search: cap(t('search&#58;')),
          searchPanes: {
              title: {
                _: cap(t('filters selected - %d')),
                0: cap(t('no filters selected')),
                1: cap(t('one filter selected')),
              },
              clearMessage: cap(t('clear all filters')),
              collapse: cap(t('searchPanes')),
              collapseMessage: cap(t('collapse all')),
              showMessage: cap(t('show all')),
              count: '{total}',
              countFiltered: '{shown} ({total})',
              emptyPanes: cap(t('no filters available')),
              loadMessage: cap(t('loading filters')),
            },
          buttons: {
            copy: t('copy'),
            csv: t('csv'),
            pdf: t('pdf'),
            copyTitle: cap(t('copy to clipboard')),
            copySuccess: {
              _: t('copied %d rows to clipboard'),
              1: t('copied 1 row to clipboard'),
            },
          },
        },
        layout: {
          topEnd: ['buttons', 'search'],
        },
        columnDefs: [
          {
            searchPanes: {
              show: true
            },
            targets: targets
          }
        ]
      }
    }

    const options = getDataTableOptions();

    return (
      <DataTable key={i18n.language} options={options}>
        {children}
      </DataTable>
    );
  }